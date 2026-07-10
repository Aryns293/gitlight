const Index = require("../index");
const { writeTreeFromEntries } = require("../tree");
const { ensureRepo } = require("../repo-guard");

class WriteTreeCommand {
  execute() {
    ensureRepo();

    const index = new Index();
    const entries = index.read();

    if (Object.keys(entries).length === 0) {
      console.error("Nothing to write — staging area is empty");
      process.exit(1);
    }

    const sha = writeTreeFromEntries(entries);
    console.log(sha);

    return sha;
  }
}

module.exports = WriteTreeCommand;
