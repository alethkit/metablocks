import * as Blockly from "blockly/core";

Blockly.defineBlocksWithJsonArray([
  {
    type: "expr_rule",
    tooltip: "test block for examples!",
    helpUrl: "",
    message0: "%1 := %2 %3",
    args0: [
      {
        type: "field_input",
        name: "rule_name",
        text: "<expr>",
      },
      {
        type: "input_end_row",
        name: "rule_name",
        align: "CENTRE",
      },
      {
        type: "input_statement",
        name: "choice",
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
  ],
  colour: 70,
};
