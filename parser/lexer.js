const patterns = require("./patterns");

function lexer(string) {
  let tokens = [];
  let pattern, match, matched;
  let i = 0;
  while (i < string.length) {
    matched = false;
    for (let name in patterns) {
      pattern = patterns[name];
      match = string.slice(i).match(pattern);
      if (match != null) {
        tokens.push({
          name: name,
          index: i,
          raw: match[0]
        });
        i += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw `Lexing error at ${i}`;
    }
  }
  tokens = tokens.filter(token => !["space", "newline"].includes(token.name));
  tokens.push({
    name: "eof",
    index: string.length,
    raw: "eof"
  });
  return tokens;
}

module.exports = lexer;
