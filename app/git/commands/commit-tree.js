const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
<<<<<<< HEAD
const Index = require("../index");
=======
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

class CommitTreeCommand {
  constructor(tree, parent, message) {
    this.tree = tree;
    this.parent = parent;
    this.message = message;
    this.gitDir = path.join(process.cwd(), ".git");
    this.author = "Aryan Sharma <arynshr293@gmail.com>";
  }

  execute() {
    const timestamp = Math.floor(Date.now() / 1000);

    let content = `tree ${this.tree}\n`;
    if (this.parent) content += `parent ${this.parent}\n`;

    content += `author ${this.author} ${timestamp} +0000\n`;
    content += `committer ${this.author} ${timestamp} +0000\n\n`;
    content += `${this.message}\n`;

    const body = Buffer.from(content);
    const header = Buffer.from(`commit ${body.length}\0`);
    const store = Buffer.concat([header, body]);

    const sha = crypto.createHash("sha1").update(store).digest("hex");

    const dir = path.join(this.gitDir, "objects", sha.slice(0, 2));
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      path.join(dir, sha.slice(2)),
      zlib.deflateSync(store)
    );

    // update HEAD
    const headPath = path.join(this.gitDir, "HEAD");
    const ref = fs.readFileSync(headPath, "utf-8").trim();

    if (ref.startsWith("ref:")) {
      const refPath = path.join(this.gitDir, ref.replace("ref: ", ""));
      fs.writeFileSync(refPath, sha);
    }

    console.log(sha);
<<<<<<< HEAD

    // clear staging area after commit
    const index = new Index();
    index.clear();
=======
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
  }
}

module.exports = CommitTreeCommand;