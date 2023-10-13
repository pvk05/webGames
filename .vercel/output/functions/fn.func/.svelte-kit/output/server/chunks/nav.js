import { c as create_ssr_component } from "./ssr.js";
const nav_svelte_svelte_type_style_lang = "";
const css = {
  code: "#navigation.svelte-1y7w97c.svelte-1y7w97c{float:left;height:50px;width:1100px;border-bottom:2px solid black}ul.svelte-1y7w97c.svelte-1y7w97c{list-style-type:none;margin:0;padding:0}li.svelte-1y7w97c.svelte-1y7w97c{float:left}li.svelte-1y7w97c a.svelte-1y7w97c{display:block;padding:17px}",
  map: null
};
const Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div id="navigation" class="svelte-1y7w97c" data-svelte-h="svelte-1c4mv3k"><ul class="svelte-1y7w97c"><li id="resourceTab" class="svelte-1y7w97c"><a href="./" class="svelte-1y7w97c">Resources</a></li> <li id="infoTab" class="svelte-1y7w97c"><a href="/clickerGame/info" class="svelte-1y7w97c">Info</a></li></ul> </div>`;
});
export {
  Nav as N
};
