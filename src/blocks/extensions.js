import * as Blockly from "blockly/core";
const dynamicConnectorMixin = {
  minInputs: 1,
  itemCount: 0,

  saveExtraState: function () {
    if (!this.isDeadOrDying() && !this.isCorrectlyFormatted()) {
      this.safelyFinalizeConnections();
    }
    return { itemCount: this.itemCount };
  },

  loadExtraState: function (state) {
    this.itemCount = state.itemCount ?? 0;
    this.addOptionalInputs();
  },

  findInputIndexForConnection: function (connection) {
    if (this.isConnectionAvailable(connection)) {
      return null;
    }

    const connectionIndex = this.getConnectionIndex(connection);
    if (connectionIndex === this.inputList.length - 1) {
      return this.inputList.length + 1;
    }

    return this.shouldAddNewConnection(connectionIndex)
      ? connectionIndex + 1
      : null;
  },

  onPendingConnection: function (connection) {
    const insertIndex = this.findInputIndexForConnection(connection);
    if (
      insertIndex !== null &&
      connection !== this.getInput("SHAPE").connection
    ) {
      this.appendValueInput(`OPT${Blockly.utils.idGenerator.genUid()}`);
      this.moveNumberedInputBefore(this.inputList.length - 1, insertIndex);
    }
  },

  finalizeConnections: function () {
    try {
      const { shapeConn, targetConns } = this.getConnectionsData();
      this.addItemInputs(targetConns, shapeConn);
      this.itemCount = targetConns.length;
    } catch (e) {
      console.error("Error in finalizeConnections:", e);
      this.restoreToValidState();
    }
  },

  tearDownBlock: function () {
    this.inputList
      .slice()
      .reverse()
      .forEach((input) => this.removeInput(input.name));
  },

  removeUnnecessaryEmptyConns: function (targetConns) {
    return targetConns.filter(
      (conn, index, array) => conn || array.length <= this.minInputs,
    );
  },

  addItemInputs: function (targetConns, shapeConn) {
    if (!Array.isArray(targetConns)) {
      console.warn("Invalid targetConns in addItemInputs");
      return;
    }

    this.removeNonEssentialInputs();
    this.ensureShapeInput(shapeConn);
    this.ensureAssignSymbolInput();
    this.addTargetConnections(targetConns);
  },

  isCorrectlyFormatted: function () {
    return this.inputList.every((input, index) => input.name === `OPT${index}`);
  },

  // Helper methods
  safelyFinalizeConnections: function () {
    Blockly.Events.disable();
    this.finalizeConnections();
    if (this instanceof Blockly.BlockSvg) this.initSvg();
    Blockly.Events.enable();
  },

  addOptionalInputs: function () {
    for (let i = this.minInputs; i < this.itemCount; i++) {
      this.appendValueInput("OPT" + i);
    }
  },

  isConnectionAvailable: function (connection) {
    return (
      !connection.targetConnection ||
      connection.targetBlock()?.isInsertionMarker()
    );
  },

  getConnectionIndex: function (connection) {
    return this.inputList.findIndex((input) => input.connection === connection);
  },

  shouldAddNewConnection: function (connectionIndex) {
    const nextInput = this.inputList[connectionIndex + 1];
    const nextConnection = nextInput?.connection?.targetConnection;
    return (
      nextConnection && !nextConnection.getSourceBlock().isInsertionMarker()
    );
  },

  getConnectionsData: function () {
    const shapeInput = this.getInput("SHAPE");
    const shapeConn = shapeInput
      ? shapeInput.connection.targetConnection
      : null;
    const targetConns = this.removeUnnecessaryEmptyConns(
      this.inputList
        .filter(
          (input) => input.name !== "assign_symbol" && input.name !== "SHAPE",
        )
        .map((i) => i.connection?.targetConnection),
    );
    return { shapeConn, targetConns };
  },

  restoreToValidState: function () {
    this.addItemInputs([], null);
    this.setOutput(true, null);
  },

  removeNonEssentialInputs: function () {
    this.inputList
      .slice()
      .reverse()
      .forEach((input) => {
        if (input.name !== "assign_symbol" && input.name !== "SHAPE") {
          this.removeInput(input.name);
        }
      });
  },

  ensureShapeInput: function (shapeConn) {
    if (!this.getInput("SHAPE")) {
      this.appendValueInput("SHAPE").appendField("Shape:");
    }
    if (shapeConn && this.getInput("SHAPE").connection) {
      this.getInput("SHAPE").connection.connect(shapeConn);
    }
  },

  ensureAssignSymbolInput: function () {
    if (!this.getInput("assign_symbol")) {
      this.appendDummyInput("assign_symbol")
        .appendField(new Blockly.FieldTextInput("ruleName"), "NAME")
        .appendField(":=");
    }
  },

  addTargetConnections: function (targetConns) {
    targetConns.forEach((targetConn, i) => {
      const input = this.appendValueInput(`OPT${i}`);
      if (targetConn && input && input.connection) {
        try {
          input.connection.connect(targetConn);
        } catch (e) {
          console.error(`Failed to connect input ${i}:`, e);
        }
      }
    });
  },
};

const minimalDynamicConnectorMixin = {
  minInputs: 1,
  itemCount: 0, // Problem: the shape token is being counted as an item input!

  // I don't think it  makes sense to have a shape input for the sum/product types
  // (shape inherited from constituent blocks?)
  //
  //TODO: adding inputs seems to ignore the shape block (so min1 means at lest 1 non shape input exists
  //, but removing of additional inputs counts the shape 1 as an input (so min1 means no actual inputs)

  // repeatedly clicking when mininputs is set to 2 iterates between 2,1, adn 0 inputs???
  //
  // n set to 3 implies that the pattern is n,1,0 input holes
  // item count is *actually* being altered by the clicks
  saveExtraState: function () {
    if (!this.isDeadOrDying() && !this.isCorrectlyFormatted()) {
      this.safelyFinalizeConnections();
    }
    return { itemCount: this.itemCount };
  },

  loadExtraState: function (state) {
    this.itemCount = state.itemCount ?? 0;
    this.addOptionalInputs();
  },

  findInputIndexForConnection: function (connection) {
    if (this.isConnectionAvailable(connection)) {
      return null;
    }

    const connectionIndex = this.getConnectionIndex(connection);
    if (connectionIndex === this.inputList.length - 1) {
      return this.inputList.length + 1;
    }

    return this.shouldAddNewConnection(connectionIndex)
      ? connectionIndex + 1
      : null;
  },

  onPendingConnection: function (connection) {
    const insertIndex = this.findInputIndexForConnection(connection);
    if (
      insertIndex !== null &&
      connection !== this.getInput("SHAPE").connection
    ) {
      this.appendValueInput(`OPT${Blockly.utils.idGenerator.genUid()}`);
      this.moveNumberedInputBefore(this.inputList.length - 1, insertIndex);
    }
  },

  finalizeConnections: function () {
    try {
      const { shapeConn, targetConns } = this.getConnectionsData();
      this.addItemInputs(targetConns, shapeConn);
      this.itemCount = targetConns.length; // TODO: altter conns here to ignore shape
    } catch (e) {
      console.error("Error in finalizeConnections:", e);
      this.restoreToValidState();
    }
  },

  tearDownBlock: function () {
    this.inputList
      .slice()
      .reverse()
      .forEach((input) => this.removeInput(input.name));
  },

  removeUnnecessaryEmptyConns: function (targetConns) {
    return targetConns.filter(
      (conn, index, array) => conn || array.length <= this.minInputs,
    );
  },

  addItemInputs: function (targetConns, shapeConn) {
    if (!Array.isArray(targetConns)) {
      console.warn("Invalid targetConns in addItemInputs");
      return;
    }

    this.removeNonEssentialInputs();
    this.ensureTitleInput();
    this.ensureShapeInput(shapeConn);
    //this.ensureAssignSymbolInput();
    this.addTargetConnections(targetConns);
    this.addOptionalInputs();
  },

  isCorrectlyFormatted: function () {
    // console.log(this.inputList); /// shows that shape is indeed counted, so thtis will be false
    return this.inputList
      .filter((input) => input.name !== "TITLE" && input.name !== "SHAPE")
      .every((input, index) => input.name === `OPT${index}`);
  },

  // Helper methods
  safelyFinalizeConnections: function () {
    Blockly.Events.disable();
    this.finalizeConnections();
    if (this instanceof Blockly.BlockSvg) this.initSvg();
    Blockly.Events.enable();
  },

  addOptionalInputs: function () {
    for (let i = this.itemCount; i < this.minInputs; i++) {
      this.appendValueInput("OPT" + i);
    }
  },

  isConnectionAvailable: function (connection) {
    return (
      !connection.targetConnection ||
      connection.targetBlock()?.isInsertionMarker()
    );
  },

  getConnectionIndex: function (connection) {
    return this.inputList.findIndex((input) => input.connection === connection);
  },

  shouldAddNewConnection: function (connectionIndex) {
    const nextInput = this.inputList[connectionIndex + 1];
    const nextConnection = nextInput?.connection?.targetConnection;
    return (
      nextConnection && !nextConnection.getSourceBlock().isInsertionMarker()
    );
  },

  getConnectionsData: function () {
    const shapeInput = this.getInput("SHAPE");
    const shapeConn = shapeInput
      ? shapeInput.connection.targetConnection
      : null;
    const targetConns = this.removeUnnecessaryEmptyConns(
      this.inputList
        .filter((input) => input.name !== "SHAPE")
        .map((i) => i.connection?.targetConnection),
    );
    return { shapeConn, targetConns };
  },

  restoreToValidState: function () {
    this.addItemInputs([], null);
    this.setOutput(true, null);
  },

  removeNonEssentialInputs: function () {
    this.inputList
      .slice()
      .reverse()
      .forEach((input) => {
        if (input.name !== "TITLE" && input.name !== "SHAPE") {
          // no swap of title
          this.removeInput(input.name);
        }
      });
  },

  ensureShapeInput: function (shapeConn) {
    if (!this.getInput("SHAPE")) {
      this.appendValueInput("SHAPE").appendField("Shape:");
    }
    if (shapeConn && this.getInput("SHAPE").connection) {
      this.getInput("SHAPE").connection.connect(shapeConn);
    }
  },

  ensureTitleInput: function () {
    if (!this.getInput("TITLE")) {
      const titleText =
        this.type === "sum_type_block" ? "Sum Type" : "Product Type";
      this.appendDummyInput("TITLE").appendField(titleText);
    }
  },

  ensureAssignSymbolInput: function () {
    if (!this.getInput("assign_symbol")) {
      this.appendDummyInput("assign_symbol")
        .appendField(new Blockly.FieldTextInput("ruleName"), "NAME")
        .appendField(":=");
    }
  },

  addTargetConnections: function (targetConns) {
    targetConns.forEach((targetConn, i) => {
      const input = this.appendValueInput(`OPT${i}`);
      if (targetConn && input && input.connection) {
        try {
          input.connection.connect(targetConn);
        } catch (e) {
          console.error(`Failed to connect input ${i}:`, e);
        }
      }
    });
  },
};

function createDynamicConnectorExtension(blockType) {
  return function () {
    this.itemCount = this.minInputs;
    this.appendDummyInput("assign_symbol")
      .appendField(
        new Blockly.FieldVariable("item", null, ["RULE"], "RULE"),
        "NAME",
      )
      .appendField(":=");

    if (blockType === "sum_type") {
      this.appendDummyInput().appendField("Sum Type");
    } else if (blockType === "product_type") {
      this.appendDummyInput().appendField("Product Type");
    }

    for (let i = 0; i < this.minInputs; i++) {
      this.appendValueInput(`OPT${i}`);
    }
  };
}

function createMinimalDynamicConnectorExtension(blockType) {
  return function () {
    this.itemCount = this.minInputs;

    if (blockType === "sum_type") {
      this.appendDummyInput().appendField("Sum Type");
    } else if (blockType === "product_type") {
      this.appendDummyInput().appendField("Product Type");
    }

    for (let i = 0; i < this.minInputs; i++) {
      this.appendValueInput(`OPT${i}`);
    }
  };
}

Blockly.Extensions.registerMutator(
  "dynamic_connector_extension_rule",
  dynamicConnectorMixin,
  createDynamicConnectorExtension("rule"),
);

Blockly.Extensions.registerMutator(
  "dynamic_connector_extension_sum",
  minimalDynamicConnectorMixin,
  createMinimalDynamicConnectorExtension("sum_type"),
);

Blockly.Extensions.registerMutator(
  "dynamic_connector_extension_product",
  minimalDynamicConnectorMixin,
  createMinimalDynamicConnectorExtension("product_type"),
);
