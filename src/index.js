import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground, toolboxCategories } from "@blockly/dev-tools";
import { category as metaBlocksCategory } from "./blocks";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

//toolboxCategories.contents += metaBlocksCategory;

const options = {
  toolbox: toolboxCategories,
};
createPlayground(
  document.getElementById("blocklyDiv"),
  (blocklyDiv, options) => {
    return Blockly.inject(blocklyDiv, options);
  },
  options,
);
