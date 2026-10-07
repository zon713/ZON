// Explicitly authorized local-only headless Edge visual inspection.
// Start Edge with an isolated temporary profile and CDP on port 9223.
import { mkdir, writeFile } from 'node:fs/promises';
const target = await (
  await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })
).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let seq = 0;
const pending = new Map();
const errors = [];
socket.onmessage = (e) => {
  const r = JSON.parse(e.data);
  if (r.id) {
    const p = pending.get(r.id);
    pending.delete(r.id);
    if (r.error) p.reject(r.error);
    else p.resolve(r.result);
  } else if (r.method === 'Runtime.exceptionThrown')
    errors.push(r.params.exceptionDetails);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function ready(expression) {
  for (let n = 0; n < 60; n++) {
    if (await evaluate(expression)) return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Timed out: ' + expression);
}
const out = process.env.PREVIEW_REVIEW_DIR || 'outputs/platform-review';
await mkdir(out, { recursive: true });
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await ready(
  "document.readyState==='complete' && !!document.querySelector('.finder-platform-links')",
);
async function screenshot(name, full = false) {
  if (full) {
    const m = await send('Page.getLayoutMetrics');
    const c = m.cssContentSize;
    const r = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: c.width, height: c.height, scale: 1 },
    });
    await writeFile(`${out}/${name}.png`, Buffer.from(r.data, 'base64'));
  } else {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`${out}/${name}.png`, Buffer.from(r.data, 'base64'));
  }
}
await screenshot('desktop-home', true);
await screenshot('desktop-hero');
await evaluate(
  "document.querySelector('.body-explorer').scrollIntoView();document.querySelector('.body-canvas button').click()",
);
await ready(
  "!!document.querySelector('.body-canvas canvas') && document.querySelectorAll('.body-hotspot').length===10",
);
await evaluate(
  "document.querySelector('#body-title').scrollIntoView({block:'start'})",
);
await new Promise((r) => setTimeout(r, 650));
await screenshot('desktop-back');
await evaluate(
  "[...document.querySelectorAll('.body-view button')].find(b=>b.textContent==='正面').click()",
);
await new Promise((r) => setTimeout(r, 650));
await screenshot('desktop-front');
const report = {
  errors,
  desktop: await evaluate(
    "({viewport:innerWidth,width:document.documentElement.scrollWidth,canvas:!!document.querySelector('canvas'),clinics:document.querySelectorAll('.clinic-entry').length})",
  ),
};
for (const width of [390, 320]) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send('Page.reload');
  await ready(
    "document.readyState==='complete' && [...document.querySelectorAll('.body-canvas button')].some(b=>b.textContent.includes('开启'))",
  );
  report[`mobile${width}ModelDeferred`] = await evaluate(
    "!performance.getEntriesByType('resource').some(e=>e.name.includes('/models/'))",
  );
  await evaluate("document.querySelector('.body-canvas button').click()");
  await ready(
    "!!document.querySelector('.body-canvas canvas') && document.querySelectorAll('.body-hotspot').length===10",
  );
  await evaluate('scrollTo(0,0)');
  await new Promise((r) => setTimeout(r, 250));
  await screenshot(`mobile-${width}`, true);
  if (width === 390) {
    await screenshot('mobile-hero');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1650,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await evaluate(
      "document.querySelector('#body-title').scrollIntoView({block:'start'})",
    );
    await evaluate(
      "[...document.querySelectorAll('.body-face-switch button')].find(b=>b.textContent==='背面').click()",
    );
    await new Promise((r) => setTimeout(r, 600));
    await screenshot('mobile-body');
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 1,
    });
    const touchBox = await evaluate(
      "(()=>{let r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()",
    );
    const touchSelection = await evaluate(
      "document.querySelector('.body-selected-title h3').textContent",
    );
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: touchBox.x, y: touchBox.y }],
    });
    await send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: touchBox.x + 100, y: touchBox.y }],
    });
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    report.touchDragPreservedSelection =
      (await evaluate(
        "document.querySelector('.body-selected-title h3').textContent",
      )) === touchSelection;
    await send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: true,
    });
  }
  report[`mobile${width}`] = await evaluate(
    "({viewport:innerWidth,width:document.documentElement.scrollWidth,model:performance.getEntriesByType('resource').filter(e=>e.name.includes('/models/')).map(e=>e.name),overflow:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && getComputedStyle(e).position!=='fixed').map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})).slice(0,20)})",
  );
}
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send('Page.reload');
await ready(
  "document.readyState==='complete' && [...document.querySelectorAll('.body-canvas button')].some(b=>b.textContent.includes('开启'))",
);
await evaluate("document.querySelector('.body-canvas button').click()");
await ready(
  "!!document.querySelector('.body-canvas canvas') && document.querySelectorAll('.body-hotspot').length===10",
);
await evaluate(
  "document.querySelector('#body-title').scrollIntoView({block:'start'})",
);
const box = await evaluate(
  "(()=>{let r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()",
);
const selectedBefore = await evaluate(
  "document.querySelector('.body-selected-title h3').textContent",
);
await send('Input.dispatchMouseEvent', {
  type: 'mousePressed',
  x: box.x,
  y: box.y,
  button: 'left',
  clickCount: 1,
});
await send('Input.dispatchMouseEvent', {
  type: 'mouseMoved',
  x: box.x + 170,
  y: box.y,
  button: 'left',
  buttons: 1,
});
await send('Input.dispatchMouseEvent', {
  type: 'mouseReleased',
  x: box.x + 170,
  y: box.y,
  button: 'left',
  clickCount: 1,
});
await screenshot('desktop-side');
report.dragPreservedSelection =
  (await evaluate(
    "document.querySelector('.body-selected-title h3').textContent",
  )) === selectedBefore;
await evaluate(
  "[...document.querySelectorAll('.body-region-list button')].find(b=>b.textContent==='腰部').click()",
);
await new Promise((r) => setTimeout(r, 600));
report.waistSelected = await evaluate(
  "document.querySelector('.body-selected-title h3').textContent==='腰部'",
);
await evaluate("document.querySelector('.body-book').click()");
await ready(
  "!!document.querySelector('[role=dialog] img[src*=appointment-mini-program]')",
);
report.qrDialog = true;
await screenshot('appointment-qr');
await send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  key: 'Escape',
  code: 'Escape',
  windowsVirtualKeyCode: 27,
});
await send('Input.dispatchKeyEvent', {
  type: 'keyUp',
  key: 'Escape',
  code: 'Escape',
  windowsVirtualKeyCode: 27,
});
await evaluate("document.querySelector('.body-text-mode').click()");
report.textFallback = await evaluate(
  "!document.querySelector('canvas') && !!document.querySelector('.body-region-list')",
);
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
socket.close();
await fetch('http://127.0.0.1:9223/json/close/' + target.id);
