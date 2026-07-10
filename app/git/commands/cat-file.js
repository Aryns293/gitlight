const { readObject } = require("../object-store");
const { parseTreeEntries } = require("../tree");
const { ensureRepo } = require("../repo-guard");

class CatFileCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }

  execute() {
    ensureRepo();

    if (!this.sha) {
      console.error("Provide object SHA");
      process.exit(1);
    }

    const { type, content } = readObject(this.sha);

    if (this.flag === "-t") {
      console.log(type);
      return;
    }

    if (this.flag !== "-p") {
      console.error(`Unknown flag: ${this.flag}`);
      process.exit(1);
    }

    if (type === "tree") {
      // A tree's content is binary (raw 20-byte SHAs), so pretty-print
      // entries as "<mode> <type> <sha>\t<name>" instead of raw bytes.
      parseTreeEntries(content).forEach((entry) => {
        console.log(`${entry.mode.padStart(6, "0")} ${entry.type} ${entry.sha}\t${entry.name}`);
      });
    } else {
      process.stdout.write(content.toString());
    }
  }
}

module.exports = CatFileCommand;
