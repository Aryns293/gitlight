const { readObject } = require("../object-store");
const { getHeadSha } = require("../refs");
const { ensureRepo } = require("../repo-guard");

class LogCommand {
  constructor(startSha) {
    this.sha = startSha;
  }

  execute() {
    ensureRepo();

    let current = this.sha || getHeadSha();

    if (!current) {
      console.error("No commits yet");
      process.exit(1);
    }

    while (current) {
      const { content } = readObject(current);
      const text = content.toString();

      // Only the first blank line separates headers from the message,
      // so the message itself can safely contain blank lines.
      const headerEnd = text.indexOf("\n\n");
      const header = headerEnd === -1 ? text : text.slice(0, headerEnd);
      const message = (headerEnd === -1 ? "" : text.slice(headerEnd + 2)).replace(/\n$/, "");

      const authorLine = header.split("\n").find((l) => l.startsWith("author"));
      const match = authorLine.match(/^author (.+) (\d+) ([+-]\d{4})$/);
      const authorDisplay = match ? match[1] : authorLine.replace("author ", "");
      const timestamp = match ? match[2] : null;

      console.log(`commit ${current}`);
      console.log(`Author: ${authorDisplay}`);
      console.log(`Date:   ${timestamp ? new Date(timestamp * 1000).toDateString() : "unknown"}`);
      console.log();
      message.split("\n").forEach((line) => console.log(`    ${line}`));
      console.log();

      const parentMatch = header.match(/^parent ([a-f0-9]{40})/m);
      current = parentMatch ? parentMatch[1] : null;
    }
  }
}

module.exports = LogCommand;
