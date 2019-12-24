const { parse, lexer, model } = require("./parser");

module.exports = builtins => {
  const { generator, generate, rules } = require("./generator")(builtins);
  return { parse, lexer, model, generator, generate, rules };
};
