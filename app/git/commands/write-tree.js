const Index = require("../index");
const { writeTreeFromEntries } = require("../tree");
const { ensureRepo } = require("../repo-guard");

class WriteTreeCommand {
  execute() {
    ensureRepo();

    const index = new Index();
    const entries = index.read();

    const sha = writeTreeFromEntries(entries);
    console.log(sha);

    return sha;
  }
}

module.exports = WriteTreeCommand;
