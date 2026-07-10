const fs = require("fs");
const path = require("path");
const { gitDir } = require("./object-store");

// Moves the branch HEAD points at (e.g. refs/heads/main) forward to the
// given commit SHA. Mirrors what a real `git commit` does after writing
// the commit object.
function updateHeadRef(sha) {
  const headPath = path.join(gitDir(), "HEAD");
  const ref = fs.readFileSync(headPath, "utf-8").trim();

  if (ref.startsWith("ref:")) {
    const refPath = path.join(gitDir(), ref.replace("ref: ", ""));
    fs.mkdirSync(path.dirname(refPath), { recursive: true });
    fs.writeFileSync(refPath, sha);
  }
}

// Reads the commit SHA the current branch points at, or null if there
// isn't one yet (i.e. no commits made, or this will be the first one).
function getHeadSha() {
  const headPath = path.join(gitDir(), "HEAD");
  const ref = fs.readFileSync(headPath, "utf-8").trim();

  if (ref.startsWith("ref:")) {
    const refPath = path.join(gitDir(), ref.replace("ref: ", ""));
    if (fs.existsSync(refPath)) {
      return fs.readFileSync(refPath, "utf-8").trim();
    }
    return null;
  }

  return ref;
}

module.exports = { updateHeadRef, getHeadSha };
