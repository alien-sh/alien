const REPL = require("./repl");
const keys = require("@alien.sh/repl/keys");
const builtins = require("./builtins");
const { generate } = require("./parser/index")({ scope: { builtins } });

const scope = {
  builtins,
  async pipe(...args) {
    const procs = [];
    for (const [index, arg] of Object.entries(args)) {
      const i = Number(index);
      const stdio =
        i == args.length - 1 ? ["pipe", "inherit", "inherit"] : "pipe";
      const proc = await arg.eval(scope, stdio);
      procs[i] = proc;
      if (i > 0) {
        procs[i - 1].stdout.pipe(proc.stdin);
      }
    }
    const result = await procs[procs.length - 1].results();
    await Promise.all(procs);
    console.log(result);
  },
  cd(path) {
    try {
      process.chdir(path);
    } catch {
      console.log(`Cannot cd to ${path}`);
    }
  },
  exit() {
    process.exit(0);
  }
};

const handle = async (core, line) => {
  const atom = await core.generate(line);
  const proc = await atom.eval(scope, "inherit");
  if (proc && proc.results) {
    const results = await proc.results();
    return results;
  }
};

const start = core => {
  const { stdin, stdout } = process;
  core.repl = new core.REPL({
    core,
    stdin,
    stdout,
    prompts: { prompt: "\ue36e >" }
  });
  for (const plugin of core.plugins) {
    plugin(core);
  }
};

const core = {
  start,
  handle,
  scope,
  generate,
  REPL,
  keys,
  onBeforePrint: [],
  onBeforeProcess: []
};

module.exports = core;
