const Index = require("../index");
const { writeTreeFromEntries } = require("../tree");
const { writeObject } = require("../object-store");
const { updateHeadRef, getHeadSha } = require("../refs");
const { getAuthorIdentity } = require("../author");
const { ensureRepo } = require("../repo-guard");

class CommitCommand {
  constructor(message) {
    this.message = message;
    this.author = getAuthorIdentity();
  }

  execute() {
    ensureRepo();

    if (!this.message) {
      console.error("Provide commit message: commit -m <message>");
      process.exit(1);
    }

    const index = new Index();
    const entries = index.read();

    if (Object.keys(entries).length === 0) {
      console.error("Nothing to commit — staging area is empty");
      process.exit(1);
    }

    const treeSha = writeTreeFromEntries(entries);

    const parentSha = getHeadSha();
    const timestamp = Math.floor(Date.now() / 1000);

    let content = `tree ${treeSha}\n`;
    if (parentSha) content += `parent ${parentSha}\n`;
    content += `author ${this.author} ${timestamp} +0000\n`;
    content += `committer ${this.author} ${timestamp} +0000\n\n`;
    content += `${this.message}\n`;

    const sha = writeObject("commit", Buffer.from(content));

    updateHeadRef(sha);

    console.log(`[main ${sha.slice(0, 7)}] ${this.message}`);
  }
}

module.exports = CommitCommand;
