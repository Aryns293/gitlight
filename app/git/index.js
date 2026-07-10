const fs = require("fs");
const path = require("path");
const { gitDir } = require("./object-store");

class Index {
  constructor() {
    this.indexPath = path.join(gitDir(), "index.json");
  }

  read() {
    if (!fs.existsSync(this.indexPath)) return {};
    return JSON.parse(fs.readFileSync(this.indexPath));
  }

  add(filePath, sha) {
    const index = this.read();
    index[filePath] = sha;
    fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
  }

  clear() {
    fs.writeFileSync(this.indexPath, JSON.stringify({}));
  }
}

module.exports = Index;
