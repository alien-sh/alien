#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const buildDir = path.join(__dirname, "build");
fs.mkdirSync(buildDir, { recursive: true }, () => {});

const prefix = process.argv[2];

execSync(`cmake -DCMAKE_INSTALL_PREFIX:PATH=${prefix} ..`, { cwd: buildDir });
execSync("cmake --build . --target install", { cwd: buildDir });
