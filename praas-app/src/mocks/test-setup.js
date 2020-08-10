
// Thiis file is resolved by Jest before the test environment has beeen
// setup.

// fetch is not available in node, add it here
import fetch from 'node-fetch';

// patch global object in node, this just needs to be done somewhere
// before the actual tests run... and this is the first place where we
// can do this close to `fetch` import without getting import reorder
// warning...
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

if (!window.fetch) {
  window.fetch = fetch;
}
