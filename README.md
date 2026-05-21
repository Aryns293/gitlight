# GitLight

A lightweight, from-scratch reimplementation of Git's core internals in Node.js — including blobs, trees, commits, SHA-1 hashing, zlib compression, and DAG-based commit traversal.

> Demystifies Git by rebuilding its plumbing layer from scratch. Objects generated are **fully compatible with real Git**.

---

## 🔥 What This Project Covers

Instead of treating Git as a black box, this project implements:

- Content-addressable object storage
- SHA-1 hashing
- Zlib compression
- Binary tree object encoding
- Commit Directed Acyclic Graph (DAG)
- Custom staging index
- CLI command execution engine
- LCS-based colored diff (same algorithm as real Git)
- Auto HEAD resolution in log
- Porcelain + Plumbing command separation
- Command Pattern architecture

---

## 🧠 Mental Model (End-to-End Flow)

```
file.txt
    ↓ gitlight add
blob (SHA1) → stored in .git/objects/
    ↓ index (staging area)
gitlight commit -m "message"
    ↓ write-tree internally
tree object → snapshot of folder
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
| hash-object | Hash and store a file as blob | git hash-object |
| write-tree | Create tree object from index | git write-tree |
| commit-tree | Create commit object manually | git commit-tree |
| cat-file -p | Inspect any object content by SHA | git cat-file -p |
| cat-file -t | Get type of any object by SHA | git cat-file -t |
| ls-tree | List tree contents | git ls-tree |

---

## 🏗 Project Structure

```
app/
  git/
    commands/
      add.js
      commit.js
      commit-tree.js
      cat-file.js
      diff.js
      hash-object.js
      init.js
      log.js
      ls-tree.js
      write-tree.js
    client.js
    index.js
  main.js
```

✔ Uses a **Command Pattern** — each Git command is an independent class with an `execute()` method.

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

### 🌳 Tree Object (Binary Encoding)

```
<mode> <filename>\0<20-byte raw SHA>
```

- Sorted lexicographically
- Matches real Git tree structure exactly

---

### 🧾 Commit Object

```
tree <treeSHA>
parent <parentSHA>
author <name> <timestamp>
committer <name> <timestamp>

<message>
```

👉 Forms a **Directed Acyclic Graph (DAG)** enabling full history traversal

---

### 🎨 Diff Output (LCS Algorithm)

Uses **Longest Common Subsequence (LCS)** — the same algorithm real Git uses — to accurately identify added, deleted, and unchanged lines.

```
diff → file.txt
--- file.txt (commit1)
+++ file.txt (commit2)
  Hello
+ New Line       ← correctly identified as insertion
  World
  Bye
```

Red = deleted lines, Green = added lines

---

### 🔗 HEAD Chain

```
HEAD → refs/heads/main → commit SHA → tree SHA → blob SHA → file content
```

`gitlight log` resolves this chain automatically — no manual SHA needed.

---

## 🧪 Example Workflow

```bash
# Initialize repository
gitlight init

# Create and stage a file
echo "Hello Git" > file.txt
gitlight add file.txt

# Commit in one command
gitlight commit -m "Initial commit"

# View history (reads HEAD automatically)
gitlight log

# Make changes and commit again
echo "Hello Git Updated" > file.txt
gitlight add file.txt
gitlight commit -m "Update file"

# Diff between two commits
gitlight diff <commit1SHA> <commit2SHA>

# Inspect any object
gitlight cat-file -t <SHA>    # get type
gitlight cat-file -p <SHA>    # get content
gitlight ls-tree <SHA>        # list tree
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

Objects created by GitLight are fully compatible with real Git.
You can copy `.git/objects/` into any real Git repository and inspect them with `git cat-file`.

---

## 🐛 Bug Fixes & Improvements

- Fixed staging area not clearing after commit
- Fixed staging area not clearing after write-tree
- Fixed SHA leaking to console during `gitlight add`
- Made `cat-file -t` flag explicit with proper error on unknown flags
- Fixed `gitlight log` to show author and human-readable date
- Fixed `gitlight log` to read HEAD automatically — no manual SHA needed
- Upgraded diff from naive line comparison to LCS algorithm

---

## 🔑 Key Technical Highlights

- **Real binary compatibility** — objects can be read by actual Git
- **Content-addressable storage** — same content always produces same SHA
- **Real zlib compression** — not simulated, same algorithm as Git
- **LCS-based diff** — Longest Common Subsequence, same as real Git
- **DAG traversal** — walks commit history via parent pointers
- **Auto HEAD resolution** — log reads HEAD automatically
- **Porcelain + Plumbing separation** — both user-friendly and low-level commands
- **Command Pattern architecture** — each command is independent and extensible

---

## 📚 Learning Objectives

This project helps you:

- Understand Git beyond surface-level usage
- Learn content-addressable storage systems
- Work with SHA-1 hashing and zlib compression
- Implement binary encoding/decoding
- Build CLI tools from scratch
- Understand DAG-based version history
- Implement LCS algorithm in a real use case

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

## 📌 Why This Project Matters

Most developers know how to use Git.
Very few understand how Git actually works internally.

👉 GitLight bridges that gap.
