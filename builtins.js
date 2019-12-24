const { spawn } = require("child_process");

class Process {
  constructor(command, args, stdio) {
    this.proc = spawn(command, args, { stdio });
    this.stdout = this.proc.stdout;
    this.stderr = this.proc.stderr;
    this.stdin = this.proc.stdin;
    this.stdoutText = [];
    this.stderrText = [];
    if (this.stdout)
      this.stdout.on("data", buf => this.stdoutText.push(buf.toString("utf8")));
    if (this.stderr)
      this.stderr.on("data", buf => this.stderrText.push(buf.toString("utf8")));
    this.proc.on("exit", () => {
      this.finished = true;
    });
  }
  results() {
    return new Promise((resolve, reject) => {
      if (this.finished) {
        resolve(this.stdoutText.join(""));
      }
      this.proc.on("exit", code => {
        if (code != 0) {
          reject(code);
        }
        resolve(this.stdoutText.join(""));
      });
    });
  }
}

class symbol {
  constructor(raw) {
    this.raw = raw;
    this.keys = raw.split(".");
  }
  get(scope) {
    let value = scope;
    for (const key of this.keys) {
      if (!(key in value)) return this.raw;
      value = value[key];
    }
    return value;
  }
}

class atom {
  constructor(command, args, src, escaped = false) {
    this.command = command;
    this.args = args;
    this.escaped = escaped;
    this.src = src;
  }
  async eval(scope, stdio) {
    const func = this.command.get(scope);
    if (!func || func == this.command.raw)
      return await this.evalShell(scope, stdio);
    const args = await Promise.all(
      this.args.map(async arg => {
        if (arg.constructor == scope.builtins.atom && !arg.escaped) {
          const result = await arg.eval(scope, "pipe");
          if (result.constructor == scope.builtins.Process) {
            return await result.results();
          }
          return result;
        }
        if (arg.constructor == scope.builtins.symbol) {
          return arg.get(scope);
        }
        return arg;
      })
    );
    return func(...args);
  }
  async evalShell(scope, stdio) {
    const args = await Promise.all(
      this.args.map(async arg => {
        if (arg.constructor == scope.builtins.atom) {
          if (!arg.escaped) {
            const result = await arg.eval(scope, "pipe");
            if (result.constructor == scope.builtins.Process) {
              return await result.results();
            }
            return result;
          } else {
            return arg.src;
          }
        }
        if (arg.constructor == scope.builtins.symbol) {
          return arg.raw;
        }
        return arg;
      })
    );
    return new scope.builtins.Process(this.command.raw, args, stdio);
  }
}

module.exports = { Process, atom, symbol };
