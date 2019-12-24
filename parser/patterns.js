const patterns = {
  string: /^"(?:[^"]|\\")*"/,
  backtick: /^`/,
  left_paren: /^[(]/,
  right_paren: /^[)]/,
  number: /^([+-]?(\d+(\.\d+)?)|(\.\d+))(?= |\n|$)/,
  boolean: /^(true|false)(?=[ \n()]|$)/,
  date: /^\d{4}-\d{2}-\d{2}(?=[ \n()]|$)/,
  symbol: /^[^ \r\n\t()]+/i,
  newline: /^\r?\n/,
  space: /^ +/
};

module.exports = patterns;
