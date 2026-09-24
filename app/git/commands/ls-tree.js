const { readObject } = require("../object-store");
const { parseTreeEntries } = require("../tree");
const { ensureRepo } = require("../repo-guard");

class LsTreeCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
    this.nameOnly = flag === "--name-only";
  }

  execute() {
    ensureRepo();

    if (!this.sha) {
      console.error("Provide tree or commit SHA");
      process.exit(1);
    }

    let { type, content } = readObject(this.sha);

    // If given a commit, resolve to its tree first
    if (type === "commit") {
      const match = content.toString().match(/^tree ([a-f0-9]{40})/m);
      if (!match) {
        console.error("Commit does not reference tree");
        process.exit(1);
      }
      const tree = readObject(match[1]);
      if (tree.type !== "tree") {
        console.error(`${match[1]} is not a tree object`);
        process.exit(1);
      }
      type = tree.type;
      content = tree.content;
    }

    if (type !== "tree") {
      console.error(`${this.sha} is not a tree object`);
      process.exit(1);
    }

    parseTreeEntries(content).forEach((entry) => {
      if (this.nameOnly) {
        console.log(entry.name);
      } else {
        console.log(`${entry.mode.padStart(6, "0")} ${entry.type} ${entry.sha} ${entry.name}`);
      }
    });
  }
}

module.exports = LsTreeCommand;
