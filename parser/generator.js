const { parse } = require("./parser");

module.exports = core => {
  const rules = {
    alien(cst, src, generator) {
      return generator(cst.program, src);
    },
    atom(cst, src, generator) {
      const { args, command, start, end } = cst;
      const source = src.slice(start, end + 1);
      const cmdArgs = args.map(arg => generator(arg, src));
      const cmd = new core.scope.builtins.symbol(command);
      return new core.scope.builtins.atom(cmd, cmdArgs, source);
    },
    escaped_atom(cst, src, generator) {
      const { args, command, start, end } = cst;
      const source = src.slice(start, end + 1);
      const cmdArgs = args.map(arg => generator(arg, src));
      const cmd = new core.scope.builtins.symbol(command);
      return new core.scope.builtins.atom(cmd, cmdArgs, source, true);
    },
    string({ raw }) {
      return raw.slice(1, -1);
    },
    number({ raw }) {
      return Number(raw);
    },
    boolean({ raw }) {
      return raw == "true";
    },
    date({ raw }) {
      return new Date(raw);
    },
    symbol({ raw }) {
      return new core.scope.builtins.symbol(raw);
    }
  };

  const generator = (cst, src) => rules[cst.name](cst, src, generator);
  const generate = src => generator(parse(src), src);

  return { generator, generate, rules };
};
