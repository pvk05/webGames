

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/boardGame/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.21bf5b0a.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.a21d6cee.js"];
export const stylesheets = [];
export const fonts = [];
