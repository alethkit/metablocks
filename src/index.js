import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground } from "@blockly/dev-tools";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

const options = {};
createPlayground(
  document.getElementById("blocklyDiv"),
  (blocklyDiv, options) => {
    return Blockly.inject(blocklyDiv, options);
  },
  options,
);
