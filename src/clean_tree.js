// File system abstraction
async function readFile(filePath) {
  if (typeof window !== "undefined") {
    const response = await fetch(filePath);
    return response.text();
  }
}

// JSON file loader
async function loadJSONFile(filePath) {
  const jsonString = await readFile(filePath);
  return JSON.parse(jsonString);
}

// Create ID to name mapping
function createIdNameMap(variables) {
  return new Map(variables.map((entry) => [entry.id, entry.name]));
}

// Token type handlers
const tokenHandlers = {
  literal_rule: (token, idNameMap) => ({
    type: "Literal",
    value: token.inputs.Rer.block.fields.TEXT,
  }),
  primitive_hole: (token) => ({
    type: "Primitive",
    value: token.fields.type_dropdown,
  }),
  block_hole: (token, idNameMap) => ({
    type: "Hole",
    value: idNameMap.get(token.inputs.rule_name.block.fields.VAR.id),
  }),
  kleene_star: (token, idNameMap) => ({
    type: "Expr List Hole",
    value: idNameMap.get(
      token.inputs.rule_name.block.inputs.rule_name.block.fields.VAR.id,
    ),
  }),
  kleene_star_stmt: () => ({ type: "Stmt List Hole", value: 5 }),
};

// Process a single token
function processToken(token, idNameMap) {
  const handler = tokenHandlers[token.type];
  return handler ? handler(token, idNameMap) : null;
}

// Process inputs for a rule
function processInputs(inputs, idNameMap) {
  return Object.entries(inputs).map(([name, content]) => {
    const unwrap = content.block;
    const tokenList =
      unwrap.type === "lists_create_with"
        ? Object.values(unwrap.inputs).map((x) => x.block)
        : [content.block];

    return tokenList
      .map((token) => processToken(token, idNameMap))
      .filter(Boolean);
  });
}

// Process a single rule
function processRule(rule, idNameMap) {
  const ruleName = idNameMap.get(rule.fields.NAME.id);
  const choices = processInputs(rule.inputs, idNameMap);
  return { name: ruleName, choices };
}

// Main processing function
async function processJSONDump(filePath) {
  const dump = await loadJSONFile(filePath);
  const idNameMap = createIdNameMap(dump.variables);
  const output = dump.blocks.blocks.map((rule) => processRule(rule, idNameMap));
  return output;
}

export { processRule, processInputs, createIdNameMap };
