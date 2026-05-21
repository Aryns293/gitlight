const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const Index = require("../index");

class WriteTreeCommand {
  constructor() {
    this.gitDir = path.join(process.cwd(), ".git");
  }

  execute() {
    const index = new Index();
    const entries = index.read();

    const buffers = [];

    Object.keys(entries)
      .sort()
      .forEach((file) => {
        const sha = entries[file];
        const mode = "100644";
        const header = Buffer.from(`${mode} ${file}\0`);
        const shaBuffer = Buffer.from(sha, "hex");

        buffers.push(header, shaBuffer);
      });

    const content = Buffer.concat(buffers);
    const header = Buffer.from(`tree ${content.length}\0`);
    const store = Buffer.concat([header, content]);

    const sha = crypto.createHash("sha1").update(store).digest("hex");

    const dir = path.join(this.gitDir, "objects", sha.slice(0, 2));
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      path.join(dir, sha.slice(2)),
      zlib.deflateSync(store)
    );

    console.log(sha);

    // clear staging area after tree is written
    index.clear();
  }
}

module.exports = WriteTreeCommand;