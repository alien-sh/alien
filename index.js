const path = require("path");
const homedir = require("os").homedir();
const core = require("./core");

const getPlugins = () => {
  try {
    return require(path.resolve(homedir, ".alien/plugins.js"));
  } catch (e) {
    return [];
  }
};

core.plugins = getPlugins();

process.title = "alien";

core.start(core);
