const fs = requre("fs");
const path = requre("path");
const { execSync } = requre("child_process");

const buildDir = path.join(__dirname, "build");
fs.mkdirSync(buildDir, { recursive: true });

execSync("cmake ..", { cwd: buildDir });
execSync("cmake --build .", { cwd: buildDir });
