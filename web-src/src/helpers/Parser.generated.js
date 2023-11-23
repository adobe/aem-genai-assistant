// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "placeholder", "symbols": ["comment"], "postprocess": ([value]) => value},
    {"name": "placeholder", "symbols": ["expression"], "postprocess": ([value]) => value},
    {"name": "comment$string$1", "symbols": [{"literal":"{"}, {"literal":"{"}, {"literal":"#"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comment$ebnf$1", "symbols": []},
    {"name": "comment$ebnf$1", "symbols": ["comment$ebnf$1", /[^}]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "comment$string$2", "symbols": [{"literal":"}"}, {"literal":"}"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comment", "symbols": ["comment$string$1", "comment$ebnf$1", "comment$string$2"], "postprocess": ([,comment]) => (null)},
    {"name": "expression$string$1", "symbols": [{"literal":"{"}, {"literal":"{"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "expression$ebnf$1", "symbols": ["modifier"], "postprocess": id},
    {"name": "expression$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "expression$ebnf$2", "symbols": ["parameters"], "postprocess": id},
    {"name": "expression$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "expression$string$2", "symbols": [{"literal":"}"}, {"literal":"}"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "expression", "symbols": ["expression$string$1", "expression$ebnf$1", "_", "identifier", "_", "expression$ebnf$2", "_", "expression$string$2"], "postprocess": ([,modifier,, identifier,, parameters]) => ({modifier, identifier, parameters})},
    {"name": "modifier", "symbols": [/[@]/], "postprocess": ([modifier]) => modifier},
    {"name": "identifier$ebnf$1", "symbols": [/[a-zA-Z0-9_]/]},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[a-zA-Z0-9_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "identifier", "symbols": ["identifier$ebnf$1"], "postprocess": ([name]) => name.join('')},
    {"name": "parameters$ebnf$1", "symbols": []},
    {"name": "parameters$ebnf$1", "symbols": ["parameters$ebnf$1", "parameter"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "parameters", "symbols": ["parameters$ebnf$1"], "postprocess": ([parameters]) => parameters},
    {"name": "parameter", "symbols": [{"literal":","}, "_", "key", "_", {"literal":"="}, "_", "value", "_"], "postprocess": ([, , key, , , , value]) => ({ key, value})},
    {"name": "key$ebnf$1", "symbols": [/[a-zA-Z0-9_]/]},
    {"name": "key$ebnf$1", "symbols": ["key$ebnf$1", /[a-zA-Z0-9_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "key", "symbols": ["key$ebnf$1"], "postprocess": ([key]) => key.join('')},
    {"name": "value", "symbols": ["string"], "postprocess": ([value]) => value},
    {"name": "value", "symbols": ["quotedString"], "postprocess": ([value]) => value},
    {"name": "string$ebnf$1", "symbols": [/[a-zA-Z0-9_?:.,']/]},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", /[a-zA-Z0-9_?:.,']/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": ["string$ebnf$1"], "postprocess": ([string]) => string.join('')},
    {"name": "quotedString$ebnf$1", "symbols": [/[a-zA-Z0-9_?:\s.,']/]},
    {"name": "quotedString$ebnf$1", "symbols": ["quotedString$ebnf$1", /[a-zA-Z0-9_?:\s.,']/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "quotedString", "symbols": [{"literal":"\""}, "quotedString$ebnf$1", {"literal":"\""}], "postprocess": ([,string]) => string.join('')}
]
  , ParserStart: "placeholder"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
