import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

// Constants
const COLORS = {
  SHAPE: 200,
  RULE: 225,
};

const SHAPE_TYPES = {
  SQUARE: "square_token",
  TRIANGLE: "triangle_token",
  CIRCLE: "circle_token",
};

const SHAPE_OUTPUT_TYPES = {
  [SHAPE_TYPES.SQUARE]: "rect-meta",
  [SHAPE_TYPES.TRIANGLE]: "trig-meta",
  [SHAPE_TYPES.CIRCLE]: "circ-meta",
};

// Shape casting
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

function defineShapeToken(shape) {
  return {
    init: function () {
      this.appendDummyInput("NAME").appendField(shape);
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setTooltip("");
      this.setHelpUrl("");
      this.setColour(COLORS.SHAPE);
    },
  };
}

Blockly.common.defineBlocks({
  [SHAPE_TYPES.SQUARE]: defineShapeToken("Square"),
  [SHAPE_TYPES.TRIANGLE]: defineShapeToken("Triangle"),
  [SHAPE_TYPES.CIRCLE]: defineShapeToken("Circle"),
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
  literal_rule: (block) => ({
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

function processToken(block, idNameMap) {
  const handler = tokenHandlers[block.type];
  return handler ? handler(block, idNameMap) : null;
}

export function interpretYuckyBlock(uglyRepr, blockSet) {
  //given normal Blockly representation, directly create blocks.
  for (const item of uglyRepr.inputList[2].connection.targetBlock().inputList) {
    console.log(item);
  }
}
// given the nice IR, directly create blocks!
export function interpretBlock(prettyRepr, blockSet) {
  prettyRepr.choices.forEach((choice, i) => {
    const block_name = `${prettyRepr.name}_c${i}`;
    Blockly.Blocks[block_name] = createBlockDefinition(prettyRepr, choice, i);
    javascriptGenerator.forBlock[block_name] = createBlockGenerator(block_name);
    blockSet.add(block_name);
  });
}

function createBlockDefinition(prettyRepr, choice, choiceIndex) {
  return {
    init: function () {
      this.appendTokenInputs(choice);
      this.setOutput(true, ["RULE", prettyRepr.shape]);
      this.setColour(COLORS.RULE);
      this.setTooltip(
        `${prettyRepr.name} (Choice ${choiceIndex + 1}): ${this.generateTooltip(choice)}`,
      );
      this.setOnChange(this.initKleeneStarInputs);
    },

    appendTokenInputs: function (tokens) {
      tokens.forEach((token, j) => {
        const inputFunction = this.getInputFunction(token);
        inputFunction.call(this, token, j);
      });

      if (this.inputList.length === 0) {
        this.appendDummyInput();
      }
    },

    getInputFunction: function (token) {
      const inputFunctions = {
        Literal: this.appendLiteralInput,
        Primitive: this.appendPrimitiveInput,
        Hole: this.appendHoleInput,
        "Expr List Hole": this.appendExprListHoleInput,
        "Stmt List Hole": this.appendStmtListHoleInput,
      };
      return inputFunctions[token.type] || (() => {});
    },

    appendLiteralInput: function (token, j) {
      this.appendDummyInput().appendField(token.value, `tok_${j}_literal`);
    },

    appendPrimitiveInput: function (token, j) {
      const primitiveInputs = {
        Str: () =>
          this.appendDummyInput(`tok_${j}_string_primitive`).appendField(
            new Blockly.FieldTextInput("test-var"),
            `tok_${j}_string_value`,
          ),
        Num: () =>
          this.appendDummyInput(`tok_${j}_number_primitive`).appendField(
            new Blockly.FieldNumber(0),
            `tok_${j}_number_value`,
          ),
        Shp: () =>
          this.appendValueInput(`tok_${j}_shape_primitive`).setCheck("Shape"),
      };
      primitiveInputs[token.value]();
    },

    appendHoleInput: function (j) {
      this.appendValueInput(`tok_${j}_hole`).setCheck("RULE");
    },

    appendExprListHoleInput: function (j) {
      this.appendValueInput(`tok_${j}_expr_list_hole`)
        .setCheck("Array")
        .appendField("*");
    },

    appendStmtListHoleInput: function (j) {
      this.appendStatementInput(`tok_${j}_stmt_list_hole`).appendField("*stmt");
    },

    generateTooltip: function (tokens) {
      const tooltipMap = {
        Literal: (token) => `Literal: "${token.value}"`,
        Primitive: (token) => `${token.value} Primitive`,
        Hole: () => "Hole",
        "Expr List Hole": () => "Expression List",
        "Stmt List Hole": () => "Statement List",
      };
      return tokens
        .map((token) => tooltipMap[token.type](token) || token.type)
        .join(", ");
    },

    initKleeneStarInputs: function (changeEvent) {
      if (changeEvent.type === Blockly.Events.BLOCK_MOVE) {
        this.inputList.forEach((input) => {
          if (
            input.name.includes("expr_list_hole") &&
            !input.connection.targetConnection
          ) {
            const listBlock = this.workspace.newBlock("lists_create_with");
            listBlock.initSvg();
            listBlock.render();
            input.connection.connect(listBlock.outputConnection);
          }
        });
      }
    },
  };
}

function createBlockGenerator(block_name) {
  return function (block) {
    const blockName = block.getFieldValue("tok_0_string_value") || null;
    const shapeBlock = block.getInputTargetBlock("tok_2_shape_primitive");
    const shape = shapeBlock ? SHAPE_OUTPUT_TYPES[shapeBlock.type] : null;

    let processed_case_list = [];
    if (block_name.includes("l3rule")) {
      processed_case_list = processL3Rule(block);
    }

    const repr = {
      block_type: block_name,
      name: blockName,
      shape: shape,
      choices: processed_case_list,
    };
    return JSON.stringify(repr, null, 2);
  };
}

function processL3Rule(block) {
  const list_block = block.getInputTargetBlock("tok_3_expr_list_hole");
  const case_list = [];
  let itemBlock = list_block.getInputTargetBlock("ADD0");
  let i = 0;
  while (itemBlock) {
    if (itemBlock.type.includes("l3case")) {
      case_list.push(itemBlock);
    }
    i++;
    itemBlock = list_block.getInputTargetBlock("ADD" + i);
  }

  return case_list.map((c) => {
    const tok_list = [];
    let caselist_block = c.getInputTargetBlock("tok_0_expr_list_hole");
    let tokenBlock = caselist_block.getInputTargetBlock("ADD0");
    while (tokenBlock) {
      tok_list.push(tokenBlock);
      tokenBlock = caselist_block.getInputTargetBlock("ADD" + tok_list.length);
    }
    return tok_list;
  });
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
  return { block_type: "rule_block", name: ruleName, shape, choices };
}

// Add code generation for rule_block
javascriptGenerator.forBlock["rule_block"] = function (block) {
  const variables = block.workspace.getAllVariables();
  const idNameMap = createIdNameMap(variables);
  const rule = processRuleBlock(block, idNameMap);
  console.debug("Rule block processed:", rule);
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
      this.setOutputBasedOnShape(shapeConn);
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
    this.setOutputTypeBasedOnShape(shapeConn);
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

  setOutputBasedOnShape: function (shapeConn) {
    this.setOutput(true, shapeConn ? null : null);
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

  setOutputTypeBasedOnShape: function (shapeConn) {
    if (shapeConn) {
      const shapeType = shapeConn.getSourceBlock().type;
      const outputType = SHAPE_OUTPUT_TYPES[shapeType] || null;
      this.setOutput(true, outputType);
    } else {
      this.setOutput(true, null);
    }
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
