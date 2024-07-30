import * as Blockly from "blockly";
import * as libraryBlocks from "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { createPlayground, toolboxCategories } from "@blockly/dev-tools";
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection";
import { TypedVariableModal } from "@blockly/plugin-typed-variable-modal";

import { category as metaBlocksCategory, createFlyout } from "./blocks";

Blockly.setLocale(En);

// Write main module code here, or as a separate file with a "src" attribute on the module script.
console.log(Blockly, libraryBlocks, javascriptGenerator, En);

const myToolbox = toolboxCategories;
myToolbox.contents.push(metaBlocksCategory);

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

createPlayground(
  document.getElementById("blocklyDiv"),
  createWorkspace,
  options,
);

BlockDynamicConnection.overrideOldBlockDefinitions();
