const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");
const path = require("path");

class HashObjectCommand {
  constructor(flag, filePath) {
    this.flag = flag;
    this.filePath = filePath;
  }

  execute() {
    if (!this.filePath) {
      console.error("No file provided");
      process.exit(1);
    }

    const content = fs.readFileSync(this.filePath);
    const header = Buffer.from(`blob ${content.length}\0`);
    const blob = Buffer.concat([header, content]);

    const sha = crypto.createHash("sha1").update(blob).digest("hex");

    if (this.flag === "-w") {
      const dir = path.join(".git", "objects", sha.slice(0, 2));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, sha.slice(2)),
        zlib.deflateSync(blob)
      );
    }

<<<<<<< HEAD
    if (this.flag !== "-w") {
      console.log(sha);
    }
=======
    console.log(sha);
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
    return sha;
  }
}

module.exports = HashObjectCommand;