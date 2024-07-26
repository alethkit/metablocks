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
    ],
    colour: 225,
  },
  {
    type: "primitive_hole",
    tooltip: "",
    helpUrl: "",
    message0: "%1 Primitive %2",
    args0: [
      {
        type: "field_dropdown",
        name: "type_dropdown",
        options: [
          ["String", "Str"],
          ["Number", "Num"],
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
    tooltip: "",
    helpUrl: "",
    message0: "%1 *",
    args0: [
      {
        type: "input_value",
        name: "rule_name",
        check: "block_hole",
      },
    ],
    output: null,
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
    {
      kind: "BLOCK",
      type: "primitive_hole",
    },
    {
      kind: "BLOCK",
      type: "block_hole",
    },

    {
      kind: "BLOCK",
      type: "kleene_star",
    },
    { kind: "category", name: "Rules", custom: "CREATE_TYPED_VARIABLE" },
  ],
  colour: 70,
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
