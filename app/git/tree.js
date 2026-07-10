const { writeObject, readObject } = require("./object-store");

// Git stores a directory entry's mode as "40000" (5 chars, no leading
// zero) in the raw tree bytes; display tools zero-pad it to "040000".
const TREE_MODE = "40000";
const BLOB_MODE = "100644";

// Turns a flat staging map { "src/index.js": sha, "file.txt": sha2 }
// into a nested structure keyed by path segment, e.g.
// { "file.txt": { type: "blob", sha }, "src": { type: "tree", children: { "index.js": {...} } } }
function buildTreeMap(entries) {
  const root = {};

  Object.keys(entries).forEach((filePath) => {
    const parts = filePath.split("/");
    let node = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!node[dir]) node[dir] = { type: "tree", children: {} };
      node = node[dir].children;
    }

    node[parts[parts.length - 1]] = { type: "blob", sha: entries[filePath] };
  });

  return root;
}

// Recursively writes one tree object per directory level (children
// first, since a directory entry needs its subtree's SHA already
// computed) and returns the SHA of the tree object for this node.
function writeTreeNode(node) {
  const buffers = [];

  Object.keys(node)
    .sort()
    .forEach((name) => {
      const entry = node[name];
      const mode = entry.type === "tree" ? TREE_MODE : BLOB_MODE;
      const sha = entry.type === "tree" ? writeTreeNode(entry.children) : entry.sha;

      buffers.push(Buffer.from(`${mode} ${name}\0`), Buffer.from(sha, "hex"));
    });

  return writeObject("tree", Buffer.concat(buffers));
}

function writeTreeFromEntries(entries) {
  return writeTreeNode(buildTreeMap(entries));
}

// Parses the raw content of one tree object into a flat list of entries
// at that level only: [{ mode, name, sha, type }]. Non-recursive, same
// as `git ls-tree`.
function parseTreeEntries(content) {
  const entries = [];
  let offset = 0;

  while (offset < content.length) {
    const modeEnd = content.indexOf(32, offset);
    const mode = content.slice(offset, modeEnd).toString();

    const nameEnd = content.indexOf(0, modeEnd + 1);
    const name = content.slice(modeEnd + 1, nameEnd).toString();

    const shaStart = nameEnd + 1;
    const shaEnd = shaStart + 20;
    const sha = content.slice(shaStart, shaEnd).toString("hex");

    entries.push({ mode, name, sha, type: mode === TREE_MODE ? "tree" : "blob" });
    offset = shaEnd;
  }

  return entries;
}

// Recursively walks a tree, descending into sub-trees, and returns a
// flat map of { "full/relative/path.js": blobSha }. Used by diff to
// compare file contents regardless of nesting depth.
function flattenTree(treeSha, prefix = "") {
  const { content } = readObject(treeSha);
  const entries = parseTreeEntries(content);
  let files = {};

  entries.forEach((entry) => {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.type === "tree") {
      files = { ...files, ...flattenTree(entry.sha, fullPath) };
    } else {
      files[fullPath] = entry.sha;
    }
  });

  return files;
}

module.exports = {
  TREE_MODE,
  BLOB_MODE,
  writeTreeFromEntries,
  parseTreeEntries,
  flattenTree,
};
