#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const buildDir = path.join(__dirname, "build");
fs.mkdirSync(buildDir, { recursive: true });

execSync("cmake ..", { cwd: buildDir });
execSync("cmake --build .", { cwd: buildDir });
