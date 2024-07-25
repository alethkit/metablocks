(*
The following is pseudo-JSON representation of a part of a "metablocks" logo
grammar (which is a list of definitions that have names and choice of tokens)

[
  { "name":"<varname>",
    "tokens": [
       { "kind":"primitive", "primitive": "string"  }
    ] },
  { "name":"<expr>",
    "choice": [
       [ { "kind":"reference", "to":"<varname>" } ],
       [ { "kind":"primitive", "primitive": "number"  } ],
       [ { "kind":"reference", "to":"<expr>" },
         { "kind":"character", "value":"+" },
         { "kind":"reference", "to":"<expr>" } ]
    ] }
]*)




// The following is an F# type definition for the above example (roughly)
// Note to self: string being used as atom type from Prolog/Lisp

type BlockKindName = string
type PrimitiveType = String | Number
type BlockElement =
  | Literal of string // represents "token" i.e what would be a label in constructed block
  | Primitive of PrimitiveType // would correspond to field (field type would be dependant on primitive type) DROPDOWN FIELD!!!!
  | Hole of BlockKindName
  | ListHole of BlockKindName // Corresponds to Kleene starred hole

type Block = BlockElement list
type Rule = { name:BlockKindName; choice:Block list }
type BNFGrammar = Rule list

// Now we can define the grammar of LOGO-like langauge using the above
let logo : BNFGrammar =
  [ { name="<varname>"; choice=[ [ Primitive(String) ] ] }


    { name="<expr>"; choice=[
        [ Hole("<varname>") ]
        [ Primitive(Number) ]
        [ Hole("<expr>"); Literal("+"); Hole("<expr>") ]
    ]}


    { name="<program>"; choice=[
        [ ListHole("<cmd>") ]
    ] }
  ]

// The quest is to turn (a more complete) description like the above
// into a nice block based visual editor...
