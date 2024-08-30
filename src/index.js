import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground, toolboxCategories } from "@blockly/dev-tools";
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection";
import { TypedVariableModal } from "@blockly/plugin-typed-variable-modal";

import {
  category as metaBlocksCategory,
  createFlyout,
  interpretBlock,
} from "./blocks";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

const myToolbox = toolboxCategories;
myToolbox.contents.push(metaBlocksCategory);

const genblocksCategory = {
  kind: "category",
  name: "Generated Blocks",
  custom: "GENERATED_BLOCKS",
};
myToolbox.contents.push(genblocksCategory);

const options = {
  toolbox: myToolbox,
  plugins: {
    connectionPreviewer: BlockDynamicConnection
      .decoratePreviewer
      // Replace with a custom connection previewer, or remove to decorate
      // the default one.
      //Blockly.InsertionMarkerPreviewer,
      (),
  },
};

// Apparently have to finish creating workspace before playground
//
function createWorkspace(blocklyDiv, options) {
  const types = [
    // Requires having more than one type in here, or else it breaks!
    ["Rule", "RULE"],
    ["Dummy", "dummy"],
  ];

  const workspace = Blockly.inject(blocklyDiv, options);
  workspace.addChangeListener((event) => {
    try {
      BlockDynamicConnection.finalizeConnections(event, workspace);
    } catch (error) {
      console.error("Error in finalizeConnections:", error);
    }
  });

  workspace.registerToolboxCategoryCallback(
    "CREATE_TYPED_VARIABLE",
    createFlyout,
  );

  const typedVarModal = new TypedVariableModal(
    workspace,
    "CREATE_TYPED_VARIABLE",
    types,
  );
  typedVarModal.init();
  return workspace;
}

window.playground = createPlayground(
  document.getElementById("blocklyDiv"),
  createWorkspace,
  options,
);

BlockDynamicConnection.overrideOldBlockDefinitions();

const ruleSelect = document.getElementById("ruleSelect");
const interpreterButton = document.getElementById("interpreterButton");

window.playground.then((playground) => {
  window.ws = playground.getWorkspace();
  window.ws.getVariablesOfType("RULE").forEach((rule) => {
    ruleSelect.add(new Option(rule.name, rule.id_));
  });
  window.gen_blocks = new Set();

  let genBlockCallback = () => {
    let x = Array.from(
      window.gen_blocks.values().map((v) => ({
        kind: "BLOCK",
        type: v,
      })),
    );
    console.log("test");
    console.log(x);
    return x;
  };
  window.ws.registerToolboxCategoryCallback(
    "GENERATED_BLOCKS",
    genBlockCallback,
  );
});

interpreterButton.addEventListener("click", () => {
  let selectedBlock = window.ws
    .getBlocksByType("rule_block")
    .filter((b) => b.getField("NAME").getValue() === ruleSelect.value)[0];
  console.log(selectedBlock);
  javascriptGenerator.init(window.ws); // Needs to be run first as initialiser???
  let generatedCode = javascriptGenerator.blockToCode(selectedBlock);
  console.log(generatedCode);
  interpretBlock(JSON.parse(generatedCode), window.gen_blocks);
});
