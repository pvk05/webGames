import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { N as Nav } from "../../../chunks/nav.js";
const leftColumn_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: "#leftcolumn.svelte-h7157w{width:350px;float:left}table.svelte-h7157w{width:100%}tr.svelte-h7157w{height:50px;border:2px solid black}",
  map: null
};
const LeftColumn = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<div id="leftcolumn" class="svelte-h7157w" data-svelte-h="svelte-dcqgfk"><table id="resourceSelector" class="svelte-h7157w"><tr onclick="clickedResource('resource')" class="svelte-h7157w"><td style="border: none; vertical-align:middle; text-align:center; width: 50px;"><i class="fa-brands fa-github fa-2x"></i></td> <td style="border: none; vertical-align:middle; text-align:center; width: 100px;"><span>Resource</span></td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="resourcePSec">0</span>/Sec</td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="resourceAmount">0</span>
				/
				<span id="resourceStorage">64</span></td></tr> <tr onclick="clickedResource('energy')" class="svelte-h7157w"><td style="border: none; vertical-align:middle; text-align:center; width: 50px;"><i class="fa-solid fa-bolt fa-2x"></i></td> <td style="border: none; vertical-align:middle; text-align:center;"><span>Energy</span></td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="energyPSec">0</span>/Sec</td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="energyAmount">0</span>
				/
				<span id="energyStorage">64</span></td></tr> <tr onclick="clickedResource('wood')" class="svelte-h7157w"><td style="border: none; vertical-align:middle; text-align:center; width: 50px;"><i class="fa-solid fa-tree fa-2x"></i></td> <td style="border: none; vertical-align:middle; text-align:center; width: 100px;"><span>Wood</span></td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="woodPSec">0</span>/Sec</td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="woodAmount">0</span>
				/
				<span id="woodStorage">64</span></td></tr> <tr onclick="clickedResource('water')" class="svelte-h7157w"><td style="border: none; vertical-align:middle; text-align:center; width: 50px;"><i class="fa-solid fa-droplet fa-2x"></i></td> <td style="border: none; vertical-align:middle; text-align:center;"><span>Water</span></td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="waterPSec">0</span>/Sec</td> <td style="border: none; vertical-align:middle; text-align:center;"><span id="waterAmount">0</span>
				/
				<span id="waterStorage">64</span></td></tr></table></div>`;
});
const content_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "#content.svelte-9azul8{float:left;width:750px}table.svelte-9azul8{width:100%}tr.svelte-9azul8{height:50px;border:2px solid black}",
  map: null
};
const Content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<div id="content" class="svelte-9azul8" data-svelte-h="svelte-1jdps8y"><table id="resourceTable" class="svelte-9azul8"><tr class="svelte-9azul8"><th><h2 id="resourceHeader">Resource</h2> <span id="resourceDescription">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Assumenda suscipit itaque illo omnis aliquam asperiores corrupti ipsa recusandae vero reprehenderit ad mollitia, modi optio nam deserunt quis nulla nemo enim!</span> <br><br> <button class="btn" onclick="clickGain(selectedResource)">Gain 1</button></th></tr> <tr class="svelte-9azul8"><td id="storageUpgradeBlock"><h3>Storage Upgrade</h3> <p>Upgrade storage to <span id="nextStorageUpgradeAmount"></span></p> <p>Cost: <span id="nextStorageUpgradeCost"></span></p> <button onclick="upgrade('storage')">Upgrade Storage</button></td></tr> <tr class="svelte-9azul8"><td id="upgradeOneBlock"><h3><span id="upgradeOneName"></span>: <span id="upgradeOneAmount">0</span></h3> <p id="upgradeOneDescription"></p> <p>Cost: <span id="nextUpgradeOneCost"></span></p> <button onclick="upgrade('one')">Buy Upgrade</button></td></tr></table> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
		ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
		mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class
		aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales
		ligula in libero. Sed dignissim lacinia nunc.</p> <p>Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis.
		Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.
		Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed
		lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa
		mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et
		ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor.</p> <p>Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet.
		Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut
		ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla
		facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam.</p></div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "p.svelte-bavftd,h1.svelte-bavftd{padding:10px}#wrapper.svelte-bavftd{margin:0 auto;width:1100px}#header.svelte-bavftd{float:left;height:80px;width:1100px;border-bottom:2px solid black}#footer.svelte-bavftd{height:50px;width:1100px;clear:both}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div id="wrapper" class="svelte-bavftd"><div id="header" class="svelte-bavftd" data-svelte-h="svelte-zsuxx0"><h1 class="svelte-bavftd">Clicker Game</h1></div> ${validate_component(Nav, "Navigation").$$render($$result, {}, {}, {})} ${validate_component(LeftColumn, "LeftColumn").$$render($$result, {}, {}, {})} ${validate_component(Content, "Content").$$render($$result, {}, {}, {})} <div id="footer" class="svelte-bavftd" data-svelte-h="svelte-1h906bb"><p class="svelte-bavftd">This is the Footer</p></div></div>`;
});
export {
  Page as default
};
