import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

import "./blocks/declarations.js";
import "./blocks/generators.js";
import "./blocks/extensions.js";

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

// Shape Definitions

function defineShapeToken(shape) {
  return {
    init: function () {
      this.appendDummyInput("NAME").appendField(shape);
      this.setInputsInline(true);
      this.setOutput(true, null); // Needed so that shape tokens can be plugged in
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

// Token Handlers: used by interpretBlock to dispatch on different types
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

// Block Interpreters

// given the nice IR, directly create blocks!
export function interpretBlock(prettyRepr, blockSet) {
  prettyRepr.choices.forEach((choice, i) => {
    const block_name = `${prettyRepr.name}_c${i}`;
    Blockly.Blocks[block_name] = createBlockDefinition(prettyRepr, choice, i);
    javascriptGenerator.forBlock[block_name] = createBlockGenerator(block_name);
    blockSet.add(block_name);
  });
}

// Block definition/generation

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
        //  console.log(`testing testing brrrrr ${j}`);
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

    // Despite unused arg, function sigs must remain the same
    appendHoleInput: function (token, j) {
      this.appendValueInput(`tok_${j}_hole`).setCheck("RULE");
    },

    appendExprListHoleInput: function (token, j) {
      console.log(`hmmm ${j}`);
      this.appendValueInput(`tok_${j}_expr_list_hole`)
        .setCheck("Array")
        .appendField("*");
    },

    appendStmtListHoleInput: function (token, j) {
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
      name: blockName,
      shape: shape,
      choices: processed_case_list,
    };
    //console.log(repr); //we're not actually turning l3tok blocks into their IR'
    return JSON.stringify(repr, null, 2);
  };
}

// Helper Functions
function processL3Rule(block) {
  //TODO: get below to work with the generated block???

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
      // wrongly assuming tokens are the nicely represented ones with sane IR, and
      //not ones result of metaprogramming
      const tokIR = getTokenIR(tokenBlock);
      tok_list.push(tokIR);
      tokenBlock = caselist_block.getInputTargetBlock("ADD" + tok_list.length);
    }
    return tok_list;
  });
}

function getTokenIR(token) {
  if (token.type.includes("l3tok")) {
  }
}

export function processInputs(block, idNameMap) {
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

export function createIdNameMap(variables) {
  return new Map(variables.map((entry) => [entry.id_, entry.name]));
}

export function processRuleBlock(rule, idNameMap) {
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
    { kind: "BLOCK", type: "sum_type_block" },
    { kind: "BLOCK", type: "inert_sum_type_block" },

    { kind: "BLOCK", type: "product_type_block" },
    { kind: "BLOCK", type: "literal_rule" },
    { kind: "BLOCK", type: "primitive_hole" },
    { kind: "BLOCK", type: "block_hole" },
    { kind: "BLOCK", type: "kleene_star" },
    { kind: "BLOCK", type: "kleene_star_stmt" },
  ],
  colour: 70,
};

export function serialiseBlock(block) {
  const type = block.type;
  const fields = {};
  const inputs = {};

  // Process fields
  for (const fieldName in block.fieldMap_) {
    fields[fieldName] = block.getFieldValue(fieldName);
  }

  // Process inputs
  for (const inputName in block.inputList) {
    const input = block.getInput(inputName);
    if (input && input.connection && input.connection.targetBlock()) {
      inputs[inputName] = serialiseBlock(input.connection.targetBlock());
    }
  }

  // Generate IR based on block type
  switch (type) {
    case "circ_to_trig_cast":
      return {
        type: "CircleToTriangle",
        input: inputs.CIRC_IN,
      };

    case "rule_block":
      return {
        type: "Rule",
        name: fields.NAME,
        shape: inputs.SHAPE ? inputs.SHAPE.type : null,
        choices: Object.values(inputs).filter(
          (input) => input.type !== "Shape",
        ),
      };
    case "sum_type_block":
      return {
        type: "SumType",
        choices: Object.values(inputs).filter(
          (input) => input.type !== "Shape",
        ),
      };
    case "product_type_block":
      return {
        type: "ProductType",
        fields: Object.values(inputs).filter((input) => input.type !== "Shape"),
      };
    case "literal_rule":
      return {
        type: "Literal",
        value: fields.TEXT,
      };
    case "primitive_hole":
      return {
        type: "Primitive",
        primitiveType: fields.type_dropdown,
      };
    case "block_hole":
      return {
        type: "Hole",
        ruleName: inputs.rule_name ? inputs.rule_name.name : null,
      };
    case "kleene_star":
      return {
        type: "KleeneStar",
        expression: inputs.rule_name,
      };
    case "kleene_star_stmt":
      return {
        type: "KleeneStarStmt",
        statement: inputs.rule_name,
      };
    case "square_token":
      return { type: "Shape", shape: "Square" };
    case "triangle_token":
      return { type: "Shape", shape: "Triangle" };
    case "circle_token":
      return { type: "Shape", shape: "Circle" };
    default:
      return { type: type, fields: fields, inputs: inputs };
  }
}

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
