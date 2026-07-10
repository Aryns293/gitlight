# GitLight

A lightweight, from-scratch reimplementation of Git's core internals in Node.js — including blobs, trees, commits, SHA-1 hashing, zlib compression, and DAG-based commit traversal.

> Demystifies Git by rebuilding its plumbing layer from scratch. Objects generated are **byte-for-byte real Git objects**, including nested folders — see [Real Git Compatible](#-real-git-compatible).

---

## 🔥 What This Project Covers

Instead of treating Git as a black box, this project implements:

- Content-addressable object storage
- SHA-1 hashing
- Zlib compression
- Recursive, nested binary tree object encoding (real sub-trees for sub-folders)
- Commit Directed Acyclic Graph (DAG)
- Persistent staging index (mirrors real Git's index semantics)
- CLI command execution engine
- LCS-based colored diff (same underlying algorithm family as real Git)
- Auto HEAD resolution in log
- Porcelain + Plumbing command separation
- Command Pattern architecture

---

## 🧠 Mental Model (End-to-End Flow)

```
file.txt, src/index.js, src/utils/helper.js
    ↓ gitlight add
blobs (SHA1) → stored in .git/objects/
    ↓ index (staging area, persists across commits)
gitlight commit -m "message"
    ↓ write-tree internally
one tree object per folder level, linked bottom-up → full snapshot
    ↓ commit-tree internally
commit object (linked via parent → DAG)
    ↓ gitlight log
traverses DAG backwards via parent pointers
```

---

## ⚙️ Implemented Commands

### 🧑‍💻 Porcelain (User Friendly)

| Command | Description | Real Git Equivalent |
|---|---|---|
| init | Initialize repository | git init |
| add | Stage file, create blob object | git add |
| commit -m | Commit staged files in one command | git commit -m |
| log | Traverse commit history (reads HEAD automatically) | git log |
| diff | Compare two commits with colored LCS-based output | git diff |

### 🔧 Plumbing (Internal / Advanced)

| Command | Description | Real Git Equivalent |
|---|---|---|
| hash-object | Hash (and optionally `-w` store) a file as blob | git hash-object |
| write-tree | Create tree object(s) from index | git write-tree |
| commit-tree | Create commit object manually from a tree SHA | git commit-tree |
| cat-file -p | Inspect any object content by SHA (pretty-prints trees) | git cat-file -p |
| cat-file -t | Get type of any object by SHA | git cat-file -t |
| ls-tree | List one tree level's contents | git ls-tree |

---

## 🏗 Project Structure

```
app/
  git/
    commands/
      add.js
      cat-file.js
      commit-tree.js
      commit.js
      diff.js
      hash-object.js
      init.js
      log.js
      ls-tree.js
      write-tree.js
    author.js        # commit identity (env-var overridable)
    client.js        # Command Pattern runner
    index.js         # staging area (index.json)
    object-store.js  # shared read/write/hash for all object types
    refs.js          # HEAD + branch ref resolution
    repo-guard.js    # friendly "not a repository" checks
    tree.js          # nested tree build/parse/flatten
  main.js
```

✔ Uses a **Command Pattern** — each Git command is an independent class with an `execute()` method. Cross-cutting concerns (object I/O, ref handling, repo checks, author identity) live in small shared modules under `app/git/` so the command classes stay focused on their own logic instead of re-implementing each other.

---

## 🔬 Internal Working

### 📦 Object Storage

All objects follow Git's exact binary format:

```
<type> <size>\0<content>
```

Then:
- SHA-1 hashed → content-addressable ID
- Zlib compressed → stored efficiently
- Saved to `.git/objects/<first2>/<remaining38>`

---

### 🌳 Tree Objects (Real Nesting)

Each entry inside a tree object:

```
<mode> <name>\0<20-byte raw SHA>
```

- File mode: `100644`
- Directory mode: `40000` (Git stores this **unpadded** on disk; `ls-tree`/`cat-file -p` display it zero-padded as `040000` — GitLight matches both)
- A folder becomes its **own tree object**, referenced from its parent tree by a `40000` entry. `src/utils/helper.js` is three linked tree objects deep, not one flat entry with a slash baked into the name
- Entries sorted lexicographically at each level

---

### 🧾 Commit Object

```
tree <treeSHA>
parent <parentSHA>
author <name> <email> <timestamp> <tz>
committer <name> <email> <timestamp> <tz>

<message>
```

👉 Forms a **Directed Acyclic Graph (DAG)** enabling full history traversal. The staging index persists across commits (like real Git's index does) — files you don't touch in a later commit stay in that commit's tree unchanged, instead of disappearing.

---

### 🎨 Diff Output (LCS Algorithm)

Uses **Longest Common Subsequence (LCS)** — the same underlying idea real Git's diff engine is built on — to accurately identify added, deleted, and unchanged lines. Descends into sub-folders, so nested files get diffed too, not just top-level ones.

```
diff → file.txt
--- file.txt (commit1)
+++ file.txt (commit2)
  Hello
+ New Line       ← correctly identified as insertion
  World
  Bye
```

Red = deleted, Green = added, Gray = unchanged context line

---

### 🔗 HEAD Chain

```
HEAD → refs/heads/main → commit SHA → tree SHA(s) → blob SHA → file content
```

`gitlight log` resolves this chain automatically — no manual SHA needed.

---

## 🧪 Example Workflow

```bash
# Initialize repository
gitlight init

# Create and stage files, including a nested folder
mkdir src
echo "Hello Git" > file.txt
echo "console.log('hi')" > src/index.js
gitlight add file.txt
gitlight add src/index.js

# Commit in one command
gitlight commit -m "Initial commit"

# View history (reads HEAD automatically)
gitlight log

# Make changes and commit again — untouched files/folders stay in the tree
echo "Hello Git Updated" > file.txt
gitlight add file.txt
gitlight commit -m "Update file"

# Diff between two commits (descends into sub-folders too)
gitlight diff <commit1SHA> <commit2SHA>

# Inspect any object
gitlight cat-file -t <SHA>    # get type
gitlight cat-file -p <SHA>    # get content (trees pretty-print their entries)
gitlight ls-tree <SHA>        # list one tree level
```

### Setting commit author identity

Commit author/committer defaults to the identity baked into this project. Override it per-run instead of editing source:

```bash
GITLIGHT_AUTHOR_NAME="Your Name" GITLIGHT_AUTHOR_EMAIL="you@example.com" gitlight commit -m "message"
```

---

## 📦 Installation & Setup

```bash
git clone https://github.com/Aryns293/gitlight
cd gitlight
npm install
sudo npm link
```

Now you can run:

```bash
gitlight <command>
```

---

## ✅ Real Git Compatible

Objects created by GitLight — blobs, trees (including multi-level nested folders), and commits — are byte-for-byte real Git objects. Copy a GitLight repo's `.git/objects/` into a real `git init` repository and `git fsck --full`, `git log`, `git ls-tree -r`, and `git checkout` all run cleanly against it, including a full working-tree checkout of nested folders, with no integrity warnings.

---

## 🐛 Bug Fixes & Improvements

- Real nested tree objects — sub-folders are their own tree objects (mode `40000`) referenced from the parent tree, instead of one flat tree with a slash baked into the entry name. Clean against real Git's `fsck` and a full checkout
- Staging index persists across commits instead of getting wiped after every commit, so a file you don't touch in a later commit stays in that commit's tree instead of dropping out of it
- Fixed `.gitignore` containing unresolved merge-conflict markers
- Every command checks the repo exists first (`fatal: not a gitlight repository`) instead of a raw Node error, and `add` no longer creates a half-formed `.git` folder if run before `init`
- Pulled duplicated tree-writing / object-writing / HEAD-ref logic out of `commit.js`, `write-tree.js`, and `commit-tree.js` into shared `object-store.js`, `tree.js`, and `refs.js` modules
- Fixed `gitlight log` truncating any commit message that contained a blank line
- Fixed the `Author:` line in `log` printing the raw timestamp/timezone after the email
- Fixed `cat-file -p` on a tree object printing raw bytes instead of pretty-printed entries
- Commit author identity is overridable via `GITLIGHT_AUTHOR_NAME` / `GITLIGHT_AUTHOR_EMAIL` env vars instead of hardcoded
- Added the `LICENSE` file to match the MIT license in `package.json`
- Removed a stray submodule reference (`test-repo`) left over from testing
- Fixed SHA leaking to console during `gitlight add`
- Made `cat-file -t` flag explicit with proper error on unknown flags
- Fixed `gitlight log` to show author and human-readable date
- Fixed `gitlight log` to read HEAD automatically — no manual SHA needed
- Upgraded diff from naive line comparison to LCS algorithm

---

## 🔑 Key Technical Highlights

- **Real binary compatibility** — objects can be read, fsck'd, and checked out by actual Git, including nested folders
- **Content-addressable storage** — same content always produces same SHA
- **Real zlib compression** — not simulated, same algorithm as Git
- **LCS-based diff** — Longest Common Subsequence, descends into sub-folders
- **DAG traversal** — walks commit history via parent pointers
- **Auto HEAD resolution** — log reads HEAD automatically
- **Porcelain + Plumbing separation** — both user-friendly and low-level commands
- **Command Pattern architecture** — each command is independent and extensible, with shared plumbing factored out
- **Friendly repository checks** — every command fails fast with a clear message instead of a raw Node error when run outside a GitLight repo
- **Configurable author identity** — via environment variables, not hardcoded

---

## 📚 Learning Objectives

This project helps you:

- Understand Git beyond surface-level usage
- Learn content-addressable storage systems
- Work with SHA-1 hashing and zlib compression
- Implement binary encoding/decoding, including recursive tree structures
- Build CLI tools from scratch
- Understand DAG-based version history
- Implement LCS algorithm in a real use case

---

## ⚠️ Known Limitations

GitLight implements Git's core object model end-to-end, but it's intentionally scoped down. A few things it deliberately does not do:

- No executable-bit or symlink detection — every file is stored as a regular file (mode `100644`)
- No packfiles, and no network protocol — no `clone`, `push`, `fetch`; everything lives in local loose objects
- The staging index is a JSON file, not Git's real binary index format
- Tree entries are sorted with a plain lexicographic sort rather than Git's exact directory-vs-file tie-break rule (only observable in the rare case of a file and folder sharing a name prefix in a specific way)
- No `branch`, `checkout`, `merge`, or `status` — see Future Plans

---

## 🔮 Future Plans

- Branch creation and switching
- Checkout command
- Merge handling
- Packfile support for large repos
- Reflog for recovery
- `gitlight status` command
- `gitlight stash` command

---

## 👨‍💻 Author

**Aryan Sharma**
Delhi Technological University

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 📌 Why This Project Matters

Most developers know how to use Git.
Very few understand how Git actually works internally.

👉 GitLight bridges that gap.
