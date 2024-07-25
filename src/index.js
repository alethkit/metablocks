import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground, toolboxCategories } from "@blockly/dev-tools";
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection";

import { category as metaBlocksCategory } from "./blocks";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

const myToolbox = toolboxCategories;
myToolbox.contents.push(metaBlocksCategory);

const options = {
  toolbox: myToolbox,
  plugins: {
    connectionPreviewer: BlockDynamicConnection.decoratePreviewer(
      // Replace with a custom connection previewer, or remove to decorate
      // the default one.
      Blockly.InsertionMarkerPreviewer,
    ),
  },
};
createPlayground(
  document.getElementById("blocklyDiv"),
  (blocklyDiv, options) => {
    return Blockly.inject(blocklyDiv, options);
  },
  options,
).then((playground) =>
  playground
    .getWorkspace()
    .addChangeListener(BlockDynamicConnection.finalizeConnections),
);

BlockDynamicConnection.overrideOldBlockDefinitions();
