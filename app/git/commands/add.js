const HashObjectCommand = require("./hash-object");
const Index = require("../index");
const { ensureRepo } = require("../repo-guard");

class AddCommand {
  constructor(filePath) {
    this.filePath = filePath;
  }

  execute() {
    ensureRepo();

    if (!this.filePath) {
      console.error("Specify file to add");
      process.exit(1);
    }

    const hashCmd = new HashObjectCommand("-w", this.filePath, true);
    const sha = hashCmd.execute();

    const index = new Index();
    index.add(this.filePath, sha);

    console.log(`Added ${this.filePath}`);
  }
}

module.exports = AddCommand;
