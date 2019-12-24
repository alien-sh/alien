const { bean, beef } = require("bean-parser");
const fs = require("fs");
const lexer = require("./lexer.js");
const { resolve } = require("path");
const alienModel = fs.readFileSync(resolve(__dirname, "alien.beef"), {
  encoding: "utf8"
});

const helpers = {};
const model = beef(alienModel, helpers);

const parse = source => {
  const tokens = lexer(source);
  const [success, result] = bean(model, tokens);
  if (success) {
    const cst = result[0];
    return cst;
  } else {
    const firstUnmatched = result[0].name;
    const expecting = model
      .filter(m => m.left == firstUnmatched)
      .map(({ right }) => right);
    const encountered = result[1].name;
    const ParsingError = `Expecting one of ${expecting.join(
      ", "
    )} but encountered ${encountered}`;
    throw ParsingError;
  }
};

module.exports = { parse, model, lexer };
