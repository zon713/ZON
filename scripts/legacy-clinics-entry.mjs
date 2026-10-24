// This function is emitted verbatim into a classic script. Keep its body ES5.
/* eslint-disable no-var, no-unused-vars -- Required ES5 variables and catch bindings in the emitted function. */
function legacyClinicsEntry(w) {
  var location = w.location;
  if (location.pathname !== '/' && location.pathname !== '/index.html') return;
  if (location.hash !== '#clinics') return;

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
  // As in the existing #clinics branch, locate=1 is intentionally not forwarded.
  if (w.__HYM_BROWSER_COMPAT__) w.__HYM_BROWSER_COMPAT__.supported = false;
  try {
    location.replace('/clinics.html');
  } catch (error) {
    // Keep the original SSR homepage and its ordinary clinic link usable.
  }
}
/* eslint-enable no-var, no-unused-vars */

export const legacyClinicsEntryScript =
  '(' + legacyClinicsEntry.toString() + ')(window);';
export const legacyClinicsEntryId = 'huiyimeng-legacy-clinics-entry';

export function addLegacyClinicsEntryBridge(html) {
  if (html.includes('id="' + legacyClinicsEntryId + '"')) return html;
  const compatibility = html.match(
    /<script\b[^>]*\bid="huiyimeng-browser-compat"[^>]*>[\s\S]*?<\/script>/i,
  )?.[0];
  if (!compatibility) throw new Error('Missing early browser compatibility script');
  const tag = '<script id="' + legacyClinicsEntryId + '">' +
    legacyClinicsEntryScript.replace(/<\/script/gi, '<\\/script') + '</script>';
  return html.replace(compatibility, compatibility + tag);
}
