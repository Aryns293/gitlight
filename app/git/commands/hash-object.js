const fs = require("fs");
const { hashObject, writeObject } = require("../object-store");
const { ensureRepo } = require("../repo-guard");

class HashObjectCommand {
  constructor(arg1, arg2, silent = false) {
    this.silent = silent;
    if (arg2) {
      this.flag = arg1;
      this.filePath = arg2;
    } else if (arg1 && arg1.startsWith("-")) {
      this.flag = arg1;
      this.filePath = null;
    } else {
      this.flag = null;
      this.filePath = arg1;
    }
  }

  execute() {
    if (!this.filePath) {
      console.error("No file provided");
      process.exit(1);
    }

    const content = fs.readFileSync(this.filePath);
    let sha;

    if (this.flag === "-w") {
      ensureRepo();
      sha = writeObject("blob", content);
      if (!this.silent) console.log(sha);
    } else if (this.flag) {
      console.error(`Unknown flag: ${this.flag}`);
      process.exit(1);
    } else {
      sha = hashObject("blob", content).sha;
      if (!this.silent) console.log(sha);
    }

    return sha;
  }
}

module.exports = HashObjectCommand;
