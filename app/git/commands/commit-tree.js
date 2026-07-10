const { writeObject } = require("../object-store");
const { updateHeadRef } = require("../refs");
const { getAuthorIdentity } = require("../author");
const { ensureRepo } = require("../repo-guard");

class CommitTreeCommand {
  constructor(tree, parent, message) {
    this.tree = tree;
    this.parent = parent;
    this.message = message;
    this.author = getAuthorIdentity();
  }

  execute() {
    ensureRepo();

    if (!this.tree || !this.message) {
      console.error("Usage: commit-tree <treeSHA> <parentSHA|\"\"> <message>");
      process.exit(1);
    }

    const timestamp = Math.floor(Date.now() / 1000);

    let content = `tree ${this.tree}\n`;
    if (this.parent) content += `parent ${this.parent}\n`;

    content += `author ${this.author} ${timestamp} +0000\n`;
    content += `committer ${this.author} ${timestamp} +0000\n\n`;
    content += `${this.message}\n`;

    const sha = writeObject("commit", Buffer.from(content));

    updateHeadRef(sha);
    console.log(sha);

    return sha;
  }
}

module.exports = CommitTreeCommand;
