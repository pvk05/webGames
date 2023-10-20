

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/clickerGame/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.78ffb8e0.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.a21d6cee.js"];
export const stylesheets = [];
export const fonts = [];
