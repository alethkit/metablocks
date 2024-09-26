import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

import "../blocks.js";

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
