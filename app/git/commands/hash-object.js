const fs = require("fs");
const { hashObject, writeObject } = require("../object-store");
const { ensureRepo } = require("../repo-guard");

class HashObjectCommand {
  constructor(flag, filePath) {
    if (filePath) {
      this.flag = flag;
      this.filePath = filePath;
    } else {
      this.flag = null;
      this.filePath = flag;
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
      console.log(sha);
    } else if (this.flag) {
      console.error(`Unknown flag: ${this.flag}`);
      process.exit(1);
    } else {
      sha = hashObject("blob", content).sha;
      console.log(sha);
    }

    return sha;
  }
}

module.exports = HashObjectCommand;
