#!/usr/bin/env node

const path = require("path");
const homedir = require("os").homedir();
const core = require("./core");

process.title = "alien";

const signals = require("@alien.sh/signals");

signals.Register(core.signals.emit);

const ppid = process.argv[2];

if (!ppid) {
  console.log("You should run alien using `alien` executable.");
  process.exit(1);
}

const checkRunning = pid => {
  try {
    return process.kill(pid, 0);
  } catch (error) {
    return error.code === "EPERM";
  }
};

setInterval(() => {
  if (!checkRunning(ppid)) {
    console.log("Alien shell was terminated.");
    console.log("Exiting");
    process.exit(0);
  }
}, 100);

const getPlugins = () => {
  try {
    return require(path.resolve(homedir, ".alien/plugins.js"));
  } catch (e) {
    return [];
  }
};

core.plugins = getPlugins();

core.start(core);
