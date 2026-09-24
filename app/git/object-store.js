const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

function gitDir() {
  let dir = process.cwd();

  while (true) {
    const candidate = path.join(dir, ".git");
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.join(process.cwd(), ".git");
}

// Computes the SHA-1 + serialized bytes for a git object without writing
// anything to disk. Shared by writeObject (below) and by hash-object,
// which needs the hash without the -w flag's side effect.
function hashObject(type, body) {
  const header = Buffer.from(`${type} ${body.length}\0`);
  const store = Buffer.concat([header, body]);
  const sha = crypto.createHash("sha1").update(store).digest("hex");
  return { sha, store };
}

// Writes any git object (blob/tree/commit) using git's real format:
// "<type> <length>\0<content>", SHA-1 hashed and zlib-compressed to
// .git/objects/<first2>/<remaining38>. Returns the SHA.
function writeObject(type, body) {
  const { sha, store } = hashObject(type, body);

  const dir = path.join(gitDir(), "objects", sha.slice(0, 2));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, sha.slice(2)), zlib.deflateSync(store));

  return sha;
}

// Reads and inflates an object by SHA, returning its type and content
// (header stripped). Exits with a friendly error if the object is missing.
function readObject(sha) {
  const objectPath = path.join(gitDir(), "objects", sha.slice(0, 2), sha.slice(2));

  if (!fs.existsSync(objectPath)) {
    console.error(`Object not found: ${sha}`);
    process.exit(1);
  }

  const raw = zlib.inflateSync(fs.readFileSync(objectPath));
  const nullIndex = raw.indexOf(0);
  const header = raw.slice(0, nullIndex).toString();
  const content = raw.slice(nullIndex + 1);
  const [type] = header.split(" ");

  return { type, content };
}

module.exports = { gitDir, hashObject, writeObject, readObject };
