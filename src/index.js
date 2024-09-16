import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground, toolboxCategories } from "@blockly/dev-tools";
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection";
import { TypedVariableModal } from "@blockly/plugin-typed-variable-modal";
import "./renderer";

import {
  category as metaBlocksCategory,
  rulesCat,
  createFlyout,
  interpretBlock,
  interpretYuckyBlock,
} from "./blocks";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

const myToolbox = toolboxCategories;
myToolbox.contents.push(metaBlocksCategory);
myToolbox.contents.push(rulesCat);

const genblocksCategory = {
  kind: "category",
  name: "Generated Blocks",
  custom: "GENERATED_BLOCKS",
};
myToolbox.contents.push(genblocksCategory);

const options = {
  renderer: "custom_renderer",
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

const ruleInput = document.getElementById("ruleInput");
const ruleList = document.getElementById("ruleList");
const interpreterButton = document.getElementById("interpreterButton");
const refreshButton = document.getElementById("refreshButton");

window.playground.then((playground) => {
  window.ws = playground.getWorkspace();
  window.ws.getAllVariables().forEach((rule) => {
    const option = document.createElement("option");
    option.value = rule.name;
    option.dataset.id = rule.id_;
    ruleList.appendChild(option);
  });
  window.gen_blocks = new Set();

  let genBlockCallback = () => {
    let x = Array.from(
      window.gen_blocks.values().map((v) => ({
        kind: "BLOCK",
        type: v,
      })),
    );
    return x;
  };
  window.ws.registerToolboxCategoryCallback(
    "GENERATED_BLOCKS",
    genBlockCallback,
  );
});

refreshButton.addEventListener("click", () => {
  ruleList.innerHTML = "";
  window.ws.getAllVariables().forEach((rule) => {
    const option = document.createElement("option");
    option.value = rule.name;
    option.dataset.id = rule.id_;
    ruleList.appendChild(option);
  });
});

// do the generated l2 blocks from l3 defs have the necessary codegen to be interpreted?
// lol, just have 2 dropdown fields
interpreterButton.addEventListener("click", () => {
  let selectedBlock = window.ws.getAllBlocks().find((b) => {
    let chosenField = b.getField("NAME") || b.getField("tok_0_string_value");
    return (
      chosenField.getValue() === ruleInput.dataset.id ||
      chosenField.getValue() === ruleInput.value ||
      chosenField.selectedOption[0] === ruleInput.value
    );
  });
  //console.log(selectedBlock);
  javascriptGenerator.init(window.ws); // Needs to be run first as initialiser???
  try {
    let generatedCode = javascriptGenerator.blockToCode(selectedBlock);
    console.log(generatedCode);
    interpretBlock(JSON.parse(generatedCode), window.gen_blocks);
  } catch (err) {
    console.log(err);
    interpretYuckyBlock(selectedBlock, window.gen_blocks);
  }
});
