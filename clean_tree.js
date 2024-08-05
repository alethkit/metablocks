async function loadJSONFile(filePath) {
  let jsonString;

  if (typeof window !== "undefined") {
    // Browser environment
    const response = await fetch(filePath);
    jsonString = await response.text();
  } else {
    // Node.js, Deno, or Bun environment
    if (typeof Deno !== "undefined") {
      // Deno
      jsonString = await Deno.readTextFile(filePath);
    } else if (typeof Bun !== "undefined") {
      // Bun
      jsonString = await Bun.file(filePath).text();
    } else {
      // Node.js
      const fs = await import("fs/promises");
      jsonString = await fs.readFile(filePath, "utf-8");
    }
  }

  return JSON.parse(jsonString);
}

var dump = await loadJSONFile("dump.json");

let parsed_dump = JSON.parse(dump);

let blocklist = parsed_dump.blocks.blocks;

let t = new Map(parsed_dump.variables.map(entry => [entry.id, entry.name]));



let output = blocklist.map(rule => {

  let opts = Object.entries(rule.inputs);
  let r = rule.fields.NAME.id;  
  let rule_name = t.get(r);

  let opt_tform = opts.map(([name, content]) => {

    let unwrap = content.block;


    let t = content.block.type;



    let token_list = Array();

    if (t === "lists_create_with") {
      token_list = Object.values(unwrap.inputs).map(x => x.block);
    }
    else {
      token_list = [content.block];
    }

    //token_list


    let simp = token_list.map(token => {

      switch (token.type) {

        case "literal_rule": { return { type: "Literal", value: token.inputs.Rer.block.fields.TEXT }; }
        case "primitive_hole": { return { type: "Primitive", value: token.fields.type_dropdown }; }
        case "block_hole": { return { type: "Hole", value: token.inputs.rule_name.block.fields.VAR.id }; }
        case "kleene_star": { return { type: "Expr List Hole", value: token.inputs.rule_name.block } }
        case "kleene_star_stmt": { return { type: "Stmt List Hole", value: 5 } }

      }
    })

    return simp;

  });


  return {"name": rule_name, "choices": opt_tform
  };

});


console.log(output);