const repl = require("@alien.sh/repl");

const hasEqualParens = str =>
  (str.match(/\(/g) || []).length == (str.match(/\)/g) || []).length;

class AlienRepl extends repl {
  constructor({ core, ...rest }) {
    super(rest);
    this.core = core;
    this.keyEaters["\r"] = [
      function(key) {
        if (this.isBusy) return;
        if (this.currentInput && hasEqualParens(this.currentInput)) {
          this.stdout.write("\n");
          this.processInput();
        } else {
          this.insertAtCursor(key);
        }
      }
    ];
  }
  preprint() {
    for (const hook of this.core.onBeforePrint) {
      hook.call(this);
    }
  }
  async processInput() {
    let src = this.currentInput;
    for (const hook of this.core.onBeforeProcess) {
      src = hook.call(this, src);
    }
    this.y = 0;
    this.x = 0;
    this.currentInput = "";
    this.currentOutput = "";
    this.stdout.write("\n");
    this.isBusy = true;
    this.stdin.pause();
    this.stdin.setRawMode(false);
    await this.core.handle(this.core, src);
    this.stdin.setRawMode(true);
    this.stdin.resume();
    this.isBusy = false;
    this.stdout.write("\n");
    this.preprint();
    this.print();
  }
}

module.exports = AlienRepl;
