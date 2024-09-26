import * as Blockly from "blockly/core";

Blockly.defineBlocksWithJsonArray([
  {
    type: "circ_to_trig_cast",
    message0: "%1",
    args0: [{ type: "input_value", name: "circ_in", check: ["circ-meta"] }],
    output: "trig-meta",
  },
  {
    type: "trig_to_circ_cast",
    message0: "%1",
    args0: [{ type: "input_value", name: "trig_in", check: ["trig-meta"] }],
    output: "circ-meta",
  },

  {
    type: "rule_block",
    tooltip: "",
    helpUrl: "",
    mutator: ["dynamic_connector_extension_rule"],
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

Blockly.Blocks["sum_type_block"] = {
  init: function () {
    this.jsonInit({
      type: "sum_type_block",
      message0: "Sum Type",
      colour: 230,
      tooltip: "Sum type block",
      helpUrl: "",
      mutator: "dynamic_connector_extension_sum",
      output: "sum-meta",
      inputsInline: false,
    });
  },
};

Blockly.Blocks["inert_sum_type_block"] = {
  init: function () {
    this.jsonInit({
      type: "inert_sum_type_block",
      message0: "Sum Type",
      colour: 230,
      tooltip: "inert Sum type block",
      helpUrl: "",
      output: null,
      inputsInline: false,
    });
  },
};

Blockly.Blocks["product_type_block"] = {
  init: function () {
    this.jsonInit({
      type: "product_type_block",
      message0: "Product Type",
      colour: 290,
      tooltip: "Product type block",
      helpUrl: "",
      mutator: "dynamic_connector_extension_product",
      output: "product-meta",
      inputsInline: false,
    });
  },
};
