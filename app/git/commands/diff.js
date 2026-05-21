const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// terminal colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

class DiffCommand {
  constructor(sha1, sha2) {
    this.sha1 = sha1;
    this.sha2 = sha2;
    this.gitDir = path.join(process.cwd(), ".git");
  }

  // read any object from .git/objects
  readObject(sha) {
    const objPath = path.join(
      this.gitDir,
      "objects",
      sha.slice(0, 2),
      sha.slice(2)
    );

    if (!fs.existsSync(objPath)) {
      console.error(`Object not found: ${sha}`);
      process.exit(1);
    }

    const raw = zlib.inflateSync(fs.readFileSync(objPath));
    const nullIndex = raw.indexOf(0);
    const header = raw.slice(0, nullIndex).toString();
    const content = raw.slice(nullIndex + 1);
    const [type] = header.split(" ");

    return { type, content };
  }

  // get tree SHA from commit SHA
  getTreeFromCommit(commitSha) {
    const { type, content } = this.readObject(commitSha);

    if (type !== "commit") {
      console.error(`${commitSha} is not a commit object`);
      process.exit(1);
    }

    const match = content.toString().match(/^tree ([a-f0-9]{40})/);
    if (!match) {
      console.error("Commit has no tree");
      process.exit(1);
    }

    return match[1];
  }

  // parse tree object → { filename: blobSHA }
  parseTree(treeSha) {
    const { content } = this.readObject(treeSha);
    const files = {};
    let offset = 0;

    while (offset < content.length) {
      const modeEnd = content.indexOf(32, offset);
      const nameEnd = content.indexOf(0, modeEnd + 1);
      const name = content.slice(modeEnd + 1, nameEnd).toString();
      const sha = content.slice(nameEnd + 1, nameEnd + 21).toString("hex");

      files[name] = sha;
      offset = nameEnd + 21;
    }

    return files;
  }

  // get blob content as array of lines
  getBlobLines(sha) {
    const { content } = this.readObject(sha);
    return content.toString().split("\n");
  }

  // line by line diff between two arrays of lines
  diffLines(oldLines, newLines) {
    const output = [];

    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        output.push(`  ${oldLine}`);               // unchanged
      } else {
        if (oldLine !== undefined) {
          output.push(`${RED}- ${oldLine}${RESET}`); // deleted
        }
        if (newLine !== undefined) {
          output.push(`${GREEN}+ ${newLine}${RESET}`); // added
        }
      }
    }

    return output;
  }

  execute() {
    if (!this.sha1 || !this.sha2) {
      console.error("Usage: diff <commit1SHA> <commit2SHA>");
      process.exit(1);
    }

    // get trees from both commits
    const treeSha1 = this.getTreeFromCommit(this.sha1);
    const treeSha2 = this.getTreeFromCommit(this.sha2);

    // get files from both trees
    const files1 = this.parseTree(treeSha1);
    const files2 = this.parseTree(treeSha2);

    // get all unique filenames
    const allFiles = new Set([
      ...Object.keys(files1),
      ...Object.keys(files2),
    ]);

    let anyDiff = false;

    allFiles.forEach((filename) => {
      const sha1 = files1[filename];
      const sha2 = files2[filename];

      // file unchanged
      if (sha1 === sha2) return;

      anyDiff = true;

      console.log(`\n${BOLD}${CYAN}diff → ${filename}${RESET}`);

      if (!sha1) {
        // file added in commit2
        console.log(`${BOLD}${GREEN}+++ ${filename} (new file)${RESET}`);
        const lines = this.getBlobLines(sha2);
        lines.forEach(l => console.log(`${GREEN}+ ${l}${RESET}`));

      } else if (!sha2) {
        // file deleted in commit2
        console.log(`${BOLD}${RED}--- ${filename} (deleted)${RESET}`);
        const lines = this.getBlobLines(sha1);
        lines.forEach(l => console.log(`${RED}- ${l}${RESET}`));

      } else {
        // file modified
        console.log(`${RED}--- ${filename} (commit1)${RESET}`);
        console.log(`${GREEN}+++ ${filename} (commit2)${RESET}`);

        const lines1 = this.getBlobLines(sha1);
        const lines2 = this.getBlobLines(sha2);
        const diffOutput = this.diffLines(lines1, lines2);
        diffOutput.forEach(l => console.log(l));
      }
    });

    if (!anyDiff) {
      console.log("No differences found between commits.");
    }
  }
}

module.exports = DiffCommand;