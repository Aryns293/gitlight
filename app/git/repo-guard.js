const fs = require("fs");
const { gitDir } = require("./object-store");

// Every command that touches .git should call this first, so a missing
// repo fails fast with a clear message instead of a raw fs error.
function ensureRepo() {
  if (!fs.existsSync(gitDir())) {
    console.error("fatal: not a gitlight repository (or any of the parent directories): .git");
    process.exit(1);
  }
}

module.exports = { ensureRepo };
