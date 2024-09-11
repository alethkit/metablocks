import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

// Shape casting
//
Blockly.defineBlocksWithJsonArray([
  {
    type: "circ_to_trig_cast",
    message0: "%1",
    args0: [
      {
        type: "input_value",
        name: "circ-in",
        check: ["circ-meta"],
      },
    ],
    output: "trig-meta",
  },
  {
    type: "trig_to_circ_cast",
    message0: "%1",
    args0: [
      {
        type: "input_value",
        name: "trig-in",
        check: ["trig-meta"],
      },
    ],
    output: "circ-meta",
  },
]);

const square_token = {
  init: function () {
    this.appendDummyInput("NAME").appendField("Square");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setColour(200);
  },
};

const triangle_token = {
  init: function () {
    this.appendDummyInput("NAME").appendField("Triangle");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setColour(200);
  },
};
const circle_token = {
  init: function () {
    this.appendDummyInput("NAME").appendField("Circle");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setColour(200);
  },
};

Blockly.common.defineBlocks({
  square_token: square_token,
  triangle_token: triangle_token,
  circle_token: circle_token,
});

Blockly.defineBlocksWithJsonArray([
  {
    type: "rule_block",
    tooltip: "",
    helpUrl: "",
    /*   message0: "%1 := %2 %3",
    args0: [
      {
        type: "input_value",
        name: "SHAPE",
      },
      {
        type: "field_variable",
        name: "NAME",
        variable: "<rule>",
        variableTypes: ["RULE"],
        defaultType: "RULE",
      },
      {
        type: "input_dummy",
        name: "assign_symbol",
      },
      {
        type: "input_value",
        name: "choices",
        check: "Array",
      },
    ],*/
    mutator: ["dynamic_connector_extension"],
    colour: 225,
  },
  {
    type: "literal_rule",
    tooltip: "",
    helpUrl: "",
    message0: "Literal %1",
    args0: [
      {
        type: "input_value",
        name: "Rer", // very unfortunate naming convention, may have to change
        check: "String",
      },
    ],
    output: null,
    colour: 225,
    inputsInline: true,
  },
  {
    type: "primitive_hole",
    tooltip: "",
    helpUrl: "",
    message0: "%1 Primitive %2", //
    args0: [
      {
        type: "field_dropdown",
        name: "type_dropdown",
        options: [
          ["String", "Str"],
          ["Number", "Num"],
          ["Shape", "Shp"],
        ],
      },
      {
        type: "input_dummy",
        name: "Type",
      },
    ],
    output: null,
    colour: 225,
  },
  {
    type: "block_hole",
    tooltip: "",
    helpUrl: "",
    message0: "%1 Hole",
    args0: [
      {
        type: "input_value",
        name: "rule_name",
        check: "RULE",
      },
    ],
    output: null,
    colour: 225,
  },

  {
    type: "kleene_star",
    tooltip: "Kleene star operator for expressions",
    helpUrl: "",
    message0: "%1 *",
    args0: [
      {
        type: "input_value",
        name: "rule_name",
        check: "RULE",
      },
    ],
    output: "RULE",
    colour: 225,
  },

  {
    type: "kleene_star_stmt",
    tooltip: "Kleene star operator for statements",
    helpUrl: "",
    message0: "%1 *stmt",
    args0: [
      {
        type: "input_value",
        name: "rule_name",
        check: "RULE",
      },
    ],
    output: "RULE",
    colour: 225,
  },
]);

const tokenHandlers = {
  literal_rule: (block, idNameMap) => ({
    type: "Literal",
    value: block.getInputTargetBlock("Rer").getFieldValue("TEXT"),
  }),
  primitive_hole: (block) => ({
    type: "Primitive",
    value: block.getFieldValue("type_dropdown"),
  }),
  block_hole: (block, idNameMap) => ({
    type: "Hole",
    value: idNameMap.get(
      block.getInputTargetBlock("rule_name").getField("VAR").getValue(),
    ),
  }),
  kleene_star: (block, idNameMap) => ({
    type: "Expr List Hole",
    value: idNameMap.get(
      block
        .getInputTargetBlock("rule_name")
        .getInputTargetBlock("rule_name")
        .getField("VAR")
        .getValue(),
    ),
  }),
  kleene_star_stmt: () => ({ type: "Stmt List Hole", value: 5 }),
};

export function interpretYuckyBlock(uglyRepr, blockSet) {
  //given normal Blockly representation, directly create blocks.
  for (const item of uglyRepr.inputList[2].connection.targetBlock().inputList) {
    console.log(item);
  }
}
// given the nice IR, directly create blocks!
export function interpretBlock(prettyRepr, blockSet) {
  prettyRepr.choices.forEach((choice, i) => {
    let block_name = `${prettyRepr.name}_c${i}`;
    Blockly.Blocks[block_name] = {
      init: function () {
        let lastInput = null;

        choice.forEach((token, j) => {
          switch (token.type) {
            case "Literal": {
              lastInput = this.appendDummyInput().appendField(
                token.value,
                `tok_${j}_literal`,
              );
              break;
            }
            case "Primitive": {
              if (token.value === "Str") {
                lastInput = this.appendDummyInput(`tok_${j}_string_primitive`)
                  //   .appendField("String")
                  .appendField(
                    new Blockly.FieldTextInput("test-var"),
                    `tok_${j}_string_value`,
                  );
              } else if (token.value === "Num") {
                lastInput = this.appendDummyInput(
                  `tok_${j}_number_primitive`,
                ).appendField(
                  new Blockly.FieldNumber(0),
                  `tok_${j}_number_value`,
                );
              } else if (token.value === "Shp") {
                lastInput = this.appendValueInput(
                  `tok_${j}_shape_primitive`,
                ).setCheck("Shape");
              }
              break;
            }
            case "Hole": {
              lastInput = this.appendValueInput(`tok_${j}_hole`).setCheck(
                "RULE",
              );
              break;
            }
            case "Expr List Hole": {
              lastInput = this.appendValueInput(`tok_${j}_expr_list_hole`)
                .setCheck("Array")
                .appendField("*");
              break;
            }
            case "Stmt List Hole": {
              lastInput = this.appendStatementInput(
                `tok_${j}_stmt_list_hole`,
              ).appendField("*stmt");
              break;
            }
          }
        });

        // If the block is empty, add a dummy input to make it visible
        if (!lastInput) {
          this.appendDummyInput();
        }

        this.setOutput(true, ["RULE", prettyRepr.shape]);
        this.setColour(225);
        this.setTooltip(
          `${prettyRepr.name} (Choice ${i + 1}): ${this.generateTooltip(choice)}`,
        );

        // Add initialization for Kleene star inputs
        this.setOnChange(function (changeEvent) {
          if (changeEvent.type === Blockly.Events.BLOCK_MOVE) {
            this.initKleeneStarInputs();
          }
        });
      },

      generateTooltip: function (tokens) {
        return tokens
          .map((token) => {
            switch (token.type) {
              case "Literal":
                return `Literal: "${token.value}"`;
              case "Primitive":
                return `${token.value} Primitive`;
              case "Hole":
                return "Hole";
              case "Expr List Hole":
                return "Expression List";
              case "Stmt List Hole":
                return "Statement List";
              default:
                return token.type;
            }
          })
          .join(", ");
      },

      initKleeneStarInputs: function () {
        this.inputList.forEach((input) => {
          if (input.name.includes("expr_list_hole")) {
            if (!input.connection.targetConnection) {
              const listBlock = this.workspace.newBlock("lists_create_with");
              listBlock.initSvg();
              listBlock.render();
              input.connection.connect(listBlock.outputConnection);
            }
          } //else if (input.name.includes('stmt_list_hole')) {
          //       if (!input.connection.targetConnection) {
          //        const statementsBlock = this.workspace.newBlock('controls_repeat_ext');
          //        statementsBlock.initSvg();
          //        statementsBlock.render();
          //       input.connection.connect(statementsBlock.previousConnection);
          //      }
          //     }
        });
      },
    };
    blockSet.add(block_name);
  });
}

// Process a single token
function processToken(block, idNameMap) {
  const handler = tokenHandlers[block.type];
  return handler ? handler(block, idNameMap) : null;
}

// Process inputs for a rule
function processInputs(block, idNameMap) {
  return block.inputList
    .slice(2)
    .map((input) => {
      const connectedBlock = input.connection.targetBlock();
      if (!connectedBlock) return null;

      if (connectedBlock.type === "lists_create_with") {
        const listBlocks = [];
        let itemBlock = connectedBlock.getInputTargetBlock("ADD0");
        let i = 0;
        while (itemBlock) {
          listBlocks.push(processToken(itemBlock, idNameMap));
          i++;
          itemBlock = connectedBlock.getInputTargetBlock("ADD" + i);
        }
        return listBlocks.filter(Boolean);
      } else {
        let t = [processToken(connectedBlock, idNameMap)];
        return t.filter(Boolean);
      }
    })
    .filter(Boolean);
}

// Create ID to name mapping
function createIdNameMap(variables) {
  return new Map(variables.map((entry) => [entry.id_, entry.name]));
}

// Process a single rule
function processRuleBlock(rule, idNameMap) {
  const ruleName = idNameMap.get(rule.getFieldValue("NAME"));
  const shapeBlock = rule.getInputTargetBlock("SHAPE");
  let shape = null; // Default to puzzle tab if no shape is connected
  if (shapeBlock) {
    switch (shapeBlock.type) {
      case "square_token":
        shape = "rect-meta";
        break;
      case "triangle_token":
        shape = "trig-meta";
        break;
      case "circle_token":
        shape = "circ-meta";
        break;
    }
  }
  const choices = processInputs(rule, idNameMap);
  return { name: ruleName, shape, choices };
}

// Add code generation for rule_block
javascriptGenerator.forBlock["rule_block"] = function (block) {
  const variables = block.workspace.getAllVariables();
  const idNameMap = createIdNameMap(variables);
  const rule = processRuleBlock(block, idNameMap);
  console.log("Rule block processed:", rule);
  return JSON.stringify(rule, null, 2);
};

// Add code generation for literal_rule
javascriptGenerator.forBlock["literal_rule"] = function (block) {
  const literal = block.getInputTargetBlock("Rer").getFieldValue("TEXT");
  return JSON.stringify({ type: "Literal", value: literal });
};

// Add code generation for primitive_hole
javascriptGenerator.forBlock["primitive_hole"] = function (block) {
  const type = block.getFieldValue("type_dropdown");
  return JSON.stringify({ type: "Primitive", value: type });
};

// Add code generation for block_hole
javascriptGenerator.forBlock["block_hole"] = function (block) {
  const ruleNameBlock = block.getInputTargetBlock("rule_name");
  const ruleName = ruleNameBlock.getFieldValue("VAR");
  return JSON.stringify({ type: "Hole", value: ruleName });
};

// Add code generation for kleene_star
javascriptGenerator.forBlock["kleene_star"] = function (block) {
  const ruleNameBlock = block.getInputTargetBlock("rule_name");
  const ruleName = ruleNameBlock
    ? javascriptGenerator.valueToCode(
        block,
        "rule_name",
        javascriptGenerator.ORDER_ATOMIC,
      )
    : null;
  return JSON.stringify({
    type: "Kleene Star",
    value: ruleName,
    isStmt: false,
  });
};

// Add code generation for kleene_star_stmt
javascriptGenerator.forBlock["kleene_star_stmt"] = function (block) {
  const ruleNameBlock = block.getInputTargetBlock("rule_name");
  const ruleName = ruleNameBlock
    ? javascriptGenerator.valueToCode(
        block,
        "rule_name",
        javascriptGenerator.ORDER_ATOMIC,
      )
    : null;
  return JSON.stringify({ type: "Kleene Star", value: ruleName, isStmt: true });
};

export const category = {
  kind: "CATEGORY",
  name: "MetaBlocks",
  contents: [
    { kind: "BLOCK", type: "circ_to_trig_cast" },
    { kind: "BLOCK", type: "trig_to_circ_cast" },
    { kind: "BLOCK", type: "square_token" },
    { kind: "BLOCK", type: "triangle_token" },
    { kind: "BLOCK", type: "circle_token" },
    { kind: "BLOCK", type: "rule_block" },
    { kind: "BLOCK", type: "literal_rule" },
    { kind: "BLOCK", type: "primitive_hole" },
    { kind: "BLOCK", type: "block_hole" },
    { kind: "BLOCK", type: "kleene_star" },
    { kind: "BLOCK", type: "kleene_star_stmt" },
  ],
  colour: 70,
};

export const rulesCat = {
  kind: "category",
  name: "Rules",
  custom: "CREATE_TYPED_VARIABLE",
};

export const createFlyout = function (workspace) {
  let xmlList = [];
  // Add your button and give it a callback name.
  const button = document.createElement("button");
  button.setAttribute("text", "Create Typed Variable");
  button.setAttribute("callbackKey", "CREATE_TYPED_VARIABLE");

  xmlList.push(button);

  // function only returns XML list, and no stdlib func to convert to JSON
  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

const dynamicConnectorMixin = {
  minInputs: 1,

  /** Count of the item inputs. */
  itemCount: 0,

  saveExtraState: function () {
    if (!this.isDeadOrDying() && !this.isCorrectlyFormatted()) {
      // If we call finalizeConnections here without disabling events, we get into
      // an event loop.
      Blockly.Events.disable();
      this.finalizeConnections();
      if (this instanceof Blockly.BlockSvg) this.initSvg();
      Blockly.Events.enable();
    }

    return {
      itemCount: this.itemCount,
    };
  },

  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.itemCount = state["itemCount"] ?? 0;
    // minInputs are added automatically.
    for (let i = this.minInputs; i < this.itemCount; i++) {
      this.appendValueInput("OPT" + i);
    }
  },

  findInputIndexForConnection: function (connection) {
    if (
      !connection.targetConnection ||
      connection.targetBlock()?.isInsertionMarker()
    ) {
      // This connection is available.
      return null;
    }

    let connectionIndex = -1;
    for (let i = 0; i < this.inputList.length; i++) {
      if (this.inputList[i].connection == connection) {
        connectionIndex = i;
      }
    }

    if (connectionIndex == this.inputList.length - 1) {
      // This connection is the last one and already has a block in it, so
      // we should add a new connection at the end.
      return this.inputList.length + 1;
    }

    const nextInput = this.inputList[connectionIndex + 1];
    const nextConnection = nextInput?.connection?.targetConnection;
    if (
      nextConnection &&
      !nextConnection.getSourceBlock().isInsertionMarker()
    ) {
      return connectionIndex + 1;
    }

    // Don't add new connection.
    return null;
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when
   * a block is dragged over one of the connections on this block.
   *
   * @param connection The connection on this block that has a pending
   *     connection.
   */
  onPendingConnection: function (connection) {
    const insertIndex = this.findInputIndexForConnection(connection);
    if (insertIndex == null) {
      return;
    }
    if (connection === this.getInput("SHAPE").connection) {
      // Don't add a new input for the shape connection
      return;
    }
    this.appendValueInput(`OPT${Blockly.utils.idGenerator.genUid()}`);
    this.moveNumberedInputBefore(this.inputList.length - 1, insertIndex);
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when a block
   * drag ends if the dragged block had a pending connection with this block.
   */
  finalizeConnections: function () {
    try {
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
      this.addItemInputs(targetConns, shapeConn);
      this.itemCount = targetConns.length;

      // Set the output type to null if there's no shape connected
      if (!shapeConn) {
        this.setOutput(true, null);
      }
    } catch (e) {
      console.error("Error in finalizeConnections:", e);
      // Attempt to restore the block to a valid state
      this.addItemInputs([], null);
      this.setOutput(true, null);
    }
  },
  /** Deletes all inputs (bar the first) on this block so it can be rebuilt. */
  tearDownBlock: function () {
    for (let i = this.inputList.length - 1; i >= 0; i--) {
      this.removeInput(this.inputList[i].name);
    }
  },

  /**
   * Filters the given target connections so that empty connections are removed,
   * unless we need those to reach the minimum input count. Empty connections
   * are removed starting at the end of the array.
   *
   * @param targetConns The list of connections associated with inputs.
   * @returns A filtered list of connections (or null/undefined) which should
   *     be attached to inputs.
   */
  removeUnnecessaryEmptyConns: function (targetConns) {
    const filteredConns = [...targetConns];
    for (let i = filteredConns.length - 1; i >= 0; i--) {
      if (!filteredConns[i] && filteredConns.length > this.minInputs) {
        filteredConns.splice(i, 1);
      }
    }
    return filteredConns;
  },

  /**
   * Adds inputs based on the given array of target conns. An input is added for
   * every entry in the array (if it does not already exist). If the entry is
   * a connection and not null/undefined the connection will be connected to
   * the input.
   *
   * @param targetConns The connections defining the inputs to add.
   */
  // Corrected addItemInputs function
  addItemInputs: function (targetConns, shapeConn) {
    if (!Array.isArray(targetConns)) {
      console.warn("Invalid targetConns in addItemInputs");
      return;
    }

    // Remove all existing inputs except 'SHAPE' and 'assign_symbol'
    for (let i = this.inputList.length - 1; i >= 0; i--) {
      if (
        this.inputList[i].name !== "assign_symbol" &&
        this.inputList[i].name !== "SHAPE"
      ) {
        this.removeInput(this.inputList[i].name);
      }
    }

    // Ensure 'SHAPE' input exists
    if (!this.getInput("SHAPE")) {
      this.appendValueInput("SHAPE").appendField("Shape:");
    }

    // Connect shape if provided, otherwise keep the SHAPE input as a placeholder
    if (shapeConn && this.getInput("SHAPE").connection) {
      this.getInput("SHAPE").connection.connect(shapeConn);
    }

    // Ensure 'assign_symbol' input exists
    if (!this.getInput("assign_symbol")) {
      this.appendDummyInput("assign_symbol")
        .appendField(new Blockly.FieldTextInput("ruleName"), "NAME")
        .appendField(":=");
    }

    for (let i = 0; i < targetConns.length; i++) {
      const input = this.appendValueInput(`OPT${i}`);
      const targetConn = targetConns[i];
      if (targetConn && input && input.connection) {
        try {
          input.connection.connect(targetConn);
        } catch (e) {
          console.error(`Failed to connect input ${i}:`, e);
        }
      }
    }

    // Set the output type based on the shape connection
    if (shapeConn) {
      const shapeType = shapeConn.getSourceBlock().type;
      switch (shapeType) {
        case "square_token":
          this.setOutput(true, "rect-meta");
          break;
        case "triangle_token":
          this.setOutput(true, "trig-meta");
          break;
        case "circle_token":
          this.setOutput(true, "circ-meta");
          break;
        default:
          this.setOutput(true, null);
      }
    } else {
      this.setOutput(true, null);
    }
  },
  /**
   * Adds the top input with the label to this block.
   *
   * @returns The added input.
   */
  addFirstInput: function () {
    // This function should not be needed with the corrected implementation
    console.warn("addFirstInput called, but should not be necessary");
  },

  /**
   * Returns true if all of the inputs on this block are in order.
   * False otherwise.
   */
  isCorrectlyFormatted: function () {
    for (let i = 0; i < this.inputList.length; i++) {
      if (this.inputList[i].name !== `OPT${i}`) return false;
    }
    return true;
  },
};

Blockly.Extensions.registerMutator(
  "dynamic_connector_extension",
  dynamicConnectorMixin,
  function () {
    this.itemCount = this.minInputs;
    this.appendDummyInput("assign_symbol")
      .appendField(
        new Blockly.FieldVariable("item", null, ["RULE"], "RULE"),
        "NAME",
      )
      .appendField(":=");
    for (let i = 0; i < this.minInputs; i++) {
      this.appendValueInput(`OPT${i}`);
    }
  },
);
