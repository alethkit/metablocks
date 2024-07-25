import * as Blockly from "blockly/core";

Blockly.defineBlocksWithJsonArray([
  {
    type: "expr_rule",
    tooltip: "test block for examples!",
    helpUrl: "",
    message0: "%1 := %2",
    args0: [
      {
        type: "field_variable", //will use variables as de-facto atom types for now
        name: "rule_name",
      },
      {
        type: "input_statement",
        name: "choice",
      },
    ],
    colour: 225,
  },
  {
    type: "expr_rule2",
    tooltip: "",
    helpUrl: "",
    message0: "%1 := %2 %3",
    args0: [
      {
        type: "input_value",
        name: "NAME",
        check: "String",
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
    ],
    colour: 225,
  },
]);

export const category = {
  kind: "CATEGORY",
  name: "MetaBlocks",
  contents: [
    {
      kind: "BLOCK",
      type: "expr_rule",
    },
    {
      kind: "BLOCK",
      type: "expr_rule2",
    },
  ],
  colour: 70,
};
