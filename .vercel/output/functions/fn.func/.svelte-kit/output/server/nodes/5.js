import * as universal from '../entries/pages/clickerGame/_page.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/clickerGame/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/clickerGame/+page.js";
export const imports = ["_app/immutable/nodes/5.74c57bc5.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.a21d6cee.js","_app/immutable/chunks/nav.5a67d195.js"];
export const stylesheets = ["_app/immutable/assets/5.98245f12.css","_app/immutable/assets/nav.4cc18e73.css"];
export const fonts = [];
