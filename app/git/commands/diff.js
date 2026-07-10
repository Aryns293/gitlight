const { readObject } = require("../object-store");
const { flattenTree } = require("../tree");
const { ensureRepo } = require("../repo-guard");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const GRAY = "\x1b[90m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

class DiffCommand {
  constructor(sha1, sha2) {
    this.sha1 = sha1;
    this.sha2 = sha2;
  }

  getTreeFromCommit(commitSha) {
    const { type, content } = readObject(commitSha);

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

  getBlobLines(sha) {
    const { content } = readObject(sha);
    return content.toString().split("\n");
  }

  buildLCS(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;

    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp;
  }

  diffLines(oldLines, newLines) {
    const dp = this.buildLCS(oldLines, newLines);
    const output = [];

    let i = oldLines.length;
    let j = newLines.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        // Unchanged context line, dimmed gray.
        output.unshift(`${GRAY}  ${oldLines[i - 1]}${RESET}`);
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        output.unshift(`${GREEN}+ ${newLines[j - 1]}${RESET}`);
        j--;
      } else {
        output.unshift(`${RED}- ${oldLines[i - 1]}${RESET}`);
        i--;
      }
    }

    return output;
  }

  execute() {
    ensureRepo();

    if (!this.sha1 || !this.sha2) {
      console.error("Usage: diff <commit1SHA> <commit2SHA>");
      process.exit(1);
    }

    const treeSha1 = this.getTreeFromCommit(this.sha1);
    const treeSha2 = this.getTreeFromCommit(this.sha2);

    // flattenTree descends into sub-trees so files inside folders are
    // compared too, not just top-level files.
    const files1 = flattenTree(treeSha1);
    const files2 = flattenTree(treeSha2);

    const allFiles = new Set([
      ...Object.keys(files1),
      ...Object.keys(files2),
    ]);

    let anyDiff = false;

    [...allFiles].sort().forEach((filename) => {
      const sha1 = files1[filename];
      const sha2 = files2[filename];

      if (sha1 === sha2) return;

      anyDiff = true;

      console.log(`\n${BOLD}${CYAN}diff → ${filename}${RESET}`);

      if (!sha1) {
        console.log(`${BOLD}${GREEN}+++ ${filename} (new file)${RESET}`);
        const lines = this.getBlobLines(sha2);
        lines.forEach((l) => console.log(`${GREEN}+ ${l}${RESET}`));
      } else if (!sha2) {
        console.log(`${BOLD}${RED}--- ${filename} (deleted)${RESET}`);
        const lines = this.getBlobLines(sha1);
        lines.forEach((l) => console.log(`${RED}- ${l}${RESET}`));
      } else {
        console.log(`${RED}--- ${filename} (commit1)${RESET}`);
        console.log(`${GREEN}+++ ${filename} (commit2)${RESET}`);

        const lines1 = this.getBlobLines(sha1);
        const lines2 = this.getBlobLines(sha2);
        const diffOutput = this.diffLines(lines1, lines2);
        diffOutput.forEach((l) => console.log(l));
      }
    });

    if (!anyDiff) {
      console.log("No differences found between commits.");
    }
  }
}

module.exports = DiffCommand;
