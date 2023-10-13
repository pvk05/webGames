

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/clickerGame/info/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.0c68f5f5.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.a21d6cee.js","_app/immutable/chunks/nav.5a67d195.js"];
export const stylesheets = ["_app/immutable/assets/7.e1528987.css","_app/immutable/assets/nav.4cc18e73.css"];
export const fonts = [];
