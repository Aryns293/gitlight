const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

class LogCommand {
  constructor(startSha) {
    this.sha = startSha;
    this.gitDir = path.join(process.cwd(), ".git");
  }

  execute() {
    let current = this.sha;

    while (current) {
      const objPath = path.join(
        this.gitDir,
        "objects",
        current.slice(0, 2),
        current.slice(2)
      );

      const data = zlib.inflateSync(fs.readFileSync(objPath)).toString();
      const content = data.split("\0")[1];

<<<<<<< HEAD
      const lines = content.split("\n");
      const author = lines.find(l => l.startsWith("author"));
      const date = author.split(" ").at(-2);
      const message = content.split("\n\n")[1];

      console.log(`commit ${current}`);
      console.log(`Author: ${author.replace("author ", "")}`);
      console.log(`Date:   ${new Date(date * 1000).toDateString()}`);
      console.log();
      console.log(`    ${message}`);
=======
      console.log(`commit ${current}`);
      console.log(content.split("\n\n")[1]);
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
      console.log();

      const parentMatch = content.match(/^parent ([a-f0-9]{40})/m);
      current = parentMatch ? parentMatch[1] : null;
    }
  }
}

module.exports = LogCommand;