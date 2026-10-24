// This function is emitted verbatim into a classic script. Keep its body ES5.
/* eslint-disable no-var, no-unused-vars -- Required ES5 variables and catch bindings in the emitted function. */
function legacyClinicsEntry(w) {
  var location = w.location;
  if (location.pathname !== '/' && location.pathname !== '/index.html') return;
  var target;
  if (location.hash === '#clinics') target = '/clinics.html';
  else if (location.hash === '#about') target = '/about.html';
  else if (location.hash === '#join') target = '/cooperation.html';
  else if (location.hash === '#faq-title') target = '/service-guide.html';
  else return;

  function decode(value) {
    try {
      return decodeURIComponent(value.replace(/\+/g, ' '));
    } catch (error) {
      return value;
    }
  }
  function queryValue(name) {
    var pairs = location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < pairs.length; i++) {
      var separator = pairs[i].indexOf('=');
      var key = separator < 0 ? pairs[i] : pairs[i].slice(0, separator);
      if (decode(key) === name) {
        return decode(separator < 0 ? '' : pairs[i].slice(separator + 1));
      }
    }
    return null;
  }

  // The existing homepage gives action=appointment priority over legacy hashes.
  if (queryValue('action') === 'appointment') return;

  // Do not hydrate the intermediate homepage while navigation is pending.
  // No query parameters are forwarded, including location and health searches.
  if (w.__HYM_BROWSER_COMPAT__) w.__HYM_BROWSER_COMPAT__.supported = false;
  try {
    location.replace(target);
  } catch (error) {
    // Keep the original SSR homepage and its ordinary clinic link usable.
  }
}
/* eslint-enable no-var, no-unused-vars */

export const legacyClinicsEntryScript =
  '(' + legacyClinicsEntry.toString() + ')(window);';
export const legacyClinicsEntryId = 'huiyimeng-legacy-clinics-entry';

export function addLegacyClinicsEntryBridge(html) {
  const scripts = [
    ...html.matchAll(/<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi),
  ];
  const withId = (id) =>
    scripts.filter((script) =>
      [
        ...script[1].matchAll(
          /(?:^|\s)id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi,
        ),
      ].some(
        (attribute) => (attribute[1] ?? attribute[2] ?? attribute[3]) === id,
      ),
    );
  const bridges = withId(legacyClinicsEntryId);
  if (bridges.length > 1)
    throw new Error('Multiple legacy entry bridge scripts');
  const compatibilityScripts = withId('huiyimeng-browser-compat');
  if (compatibilityScripts.length !== 1)
    throw new Error('Missing or ambiguous early browser compatibility script');
  const compatibility = compatibilityScripts[0];
  const compatibilityEnd = compatibility.index + compatibility[0].length;
  const bridge = bridges[0];
  if (bridge && bridge.index < compatibilityEnd)
    throw new Error(
      'Legacy entry bridge must appear after browser compatibility script',
    );
  const tag =
    '<script id="' +
    legacyClinicsEntryId +
    '">' +
    legacyClinicsEntryScript.replace(/<\/script/gi, '<\\/script') +
    '</script>';
  if (bridge) {
    // Upgrade one existing marker in place; do not move any surrounding DOM.
    return (
      html.slice(0, bridge.index) +
      tag +
      html.slice(bridge.index + bridge[0].length)
    );
  }
  return html.slice(0, compatibilityEnd) + tag + html.slice(compatibilityEnd);
}
