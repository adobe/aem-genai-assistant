@builtin "whitespace.ne"

placeholder -> comment {% ([value]) => value %} | expression {% ([value]) => value %}
comment -> "{{#" [^}]:* "}}" {% ([,comment]) => (null) %}
expression -> "{{" modifier:? _ identifier _ parameters:? _ "}}" {% ([,modifier,, identifier,, parameters]) => ({modifier, identifier, parameters}) %}
modifier -> [@] {% ([modifier]) => modifier %}
identifier -> [a-zA-Z0-9_]:+ {% ([name]) => name.join('') %}
parameters -> parameter:* {% ([parameters]) => parameters %}
parameter -> "," _ key _ "=" _ value _ {% ([, , key, , , , value]) => ({ key, value}) %}
key -> [a-zA-Z0-9_]:+ {% ([key]) => key.join('') %}
value -> string {% ([value]) => value %} | quotedString {% ([value]) => value %}
string -> [a-zA-Z0-9\-_?:.,']:+ {% ([string]) => string.join('') %}
quotedString -> "\"" [a-zA-Z0-9\-_=/&?:\s.,']:+ "\"" {% ([,string]) => string.join('') %}
