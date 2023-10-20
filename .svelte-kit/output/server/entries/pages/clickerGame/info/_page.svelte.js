import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { N as Nav } from "../../../../chunks/nav.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "p.svelte-cmpwz0,h1.svelte-cmpwz0{padding:10px}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<h1 class="svelte-cmpwz0" data-svelte-h="svelte-15mqqng">Info</h1> ${validate_component(Nav, "Navigation").$$render($$result, {}, {}, {})} <p class="svelte-cmpwz0" data-svelte-h="svelte-pdum95">Occaecat duis deserunt ut id quis sit anim labore id mollit. Ea pariatur ullamco et irure ullamco ex nulla laborum cupidatat in deserunt sit minim sint. Exercitation sunt aute nisi culpa commodo veniam culpa culpa nisi ex excepteur. Ea est commodo sit aliqua. Velit sit mollit ullamco tempor sint mollit laborum nisi incididunt laboris nostrud dolor. Labore deserunt ea eiusmod nostrud ea irure commodo qui proident aliquip qui.</p>`;
});
export {
  Page as default
};
