const path = require("path");
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

    const absolute = path.resolve(this.filePath);
    const rel = path.relative(process.cwd(), absolute);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      console.error("fatal: file is outside repository");
      process.exit(1);
    }

    const normalized = rel.split(path.sep).join("/");

    const hashCmd = new HashObjectCommand("-w", this.filePath, true);
    const sha = hashCmd.execute();

    const index = new Index();
    index.add(normalized, sha);

    console.log(`Added ${normalized}`);
  }
}

module.exports = AddCommand;
