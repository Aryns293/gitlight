# Git Object Engine

<<<<<<< HEAD
A simplified, from-scratch implementation of the Git version control system written in Node.js.

This project re-implements Git’s core internal architecture including blobs, trees, commits, object storage, hashing, compression, and commit graph traversal — to deeply understand how Git works under the hood.

---

## 🚀 Overview

git-object-engine demystifies Git by rebuilding its core plumbing commands from scratch.

Instead of treating Git as a black box, this project implements:

- Content-addressable object storage
- SHA-1 hashing
- Zlib compression
- Binary tree object encoding
- Commit Directed Acyclic Graph (DAG)
- A custom staging index
- CLI command execution engine

---

## 🧠 Core Concepts Implemented

### 1️⃣ The `.git` Directory

Recreates Git’s internal repository structure:

```
.git/
  ├── objects/
  ├── refs/
  └── HEAD
=======
A simplified, from-scratch implementation of Git written in Node.js that rebuilds Git’s core internal architecture — including blobs, trees, commits, object storage, hashing, compression, and commit graph traversal.

> This project is designed to **demystify Git internals** by implementing its plumbing layer from scratch.

---

## 🔥 What This Project Covers

Instead of treating Git as a black box, this project implements:

* Content-addressable object storage
* SHA-1 hashing
* Zlib compression
* Binary tree object encoding
* Commit Directed Acyclic Graph (DAG)
* Custom staging index
* CLI command execution engine

---

## 🧠 Mental Model (End-to-End Flow)

```
file.txt
   ↓ add
blob (SHA1)
   ↓ index (staging)
write-tree
   ↓
tree object
   ↓
commit-tree
   ↓
commit (linked via parent → DAG)
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
```

---

<<<<<<< HEAD
### 2️⃣ Git Objects

#### 🔹 Blob
- Stores raw file contents
- Format: `blob <size>\0<content>`
- SHA-1 hashed
- Zlib compressed

#### 🔹 Tree
- Represents directory structure
- Stores entries in binary format:
  
  ```
  <mode> <filename>\0<20-byte raw SHA>
  ```
- Sorted lexicographically
- Prefixed with: `tree <size>\0`

#### 🔹 Commit
- Points to a tree
- Links to parent commit(s)
- Stores author, committer, timestamp, and message
- Forms a commit DAG

---

## ⚙️ Implemented Commands

| Command | Description |
|----------|-------------|
| `init` | Initialize a new repository |
| `add` | Stage file (creates blob + updates index) |
| `write-tree` | Create tree object from staged files |
| `commit-tree` | Create commit object |
| `cat-file` | Inspect object contents |
| `ls-tree` | List tree contents |
| `log` | Traverse commit history |

---

## 🏗 Architecture
=======
## ⚙️ Implemented Commands

| Command     | Description                      | Real Git Equivalent |
| ----------- | -------------------------------- | ------------------- |
| init        | Initialize repository            | git init            |
| add         | Stage file (create blob + index) | git add             |
| write-tree  | Create tree from index           | git write-tree      |
| commit-tree | Create commit                    | git commit-tree     |
| cat-file    | Inspect object contents          | git cat-file        |
| ls-tree     | List tree contents               | git ls-tree         |
| log         | Traverse commit history          | git log             |

---

## 🏗 Project Structure
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

```
app/
  git/
    commands/
      add.js
      hash-object.js
      write-tree.js
      commit-tree.js
      cat-file.js
      ls-tree.js
      log.js
    client.js
    index.js
  main.js
```

<<<<<<< HEAD
Uses a command pattern architecture where each Git command is encapsulated in a class with an `execute()` method.

---

## 🔬 How It Works Internally

### Object Storage

All objects are:

1. Prefixed with header (`type size\0`)
2. SHA-1 hashed
3. Compressed using zlib
4. Stored in:
=======
✔ Uses a **Command Pattern**
Each Git command is implemented as a class with an `execute()` method.

---

## 🔬 Internal Working

### 📦 Object Storage

All objects follow Git’s format:

```
<type> <size>\0<content>
```

Then:

* SHA-1 hashed
* Zlib compressed
* Stored in:
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

```
.git/objects/<first2>/<remaining38>
```

---

<<<<<<< HEAD
### Commit Graph

Each commit stores:
=======
### 🌳 Tree Object (Binary Encoding)

```
<mode> <filename>\0<20-byte raw SHA>
```

* Sorted lexicographically
* Matches real Git tree structure

---

### 🧾 Commit Object
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

```
tree <treeSHA>
parent <parentSHA>
<<<<<<< HEAD
author ...
committer ...
=======
author <name> <timestamp>
committer <name> <timestamp>
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

<message>
```

<<<<<<< HEAD
This creates a Directed Acyclic Graph (DAG) enabling history traversal.
=======
👉 Forms a **Directed Acyclic Graph (DAG)** enabling history traversal
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

---

## 🧪 Example Workflow

```bash
# Initialize repository
git-object-engine init

<<<<<<< HEAD
# Add file
echo "Hello Git" > file.txt
=======
# Create a file
echo "Hello Git" > file.txt

# Stage file
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
git-object-engine add file.txt

# Create tree
treeSHA=$(git-object-engine write-tree)

# Create commit
commitSHA=$(git-object-engine commit-tree $treeSHA "" "Initial commit")

# View history
git-object-engine log $commitSHA
```

---

<<<<<<< HEAD
## 📚 Learning Goals

This project was built to:

- Understand Git internals beyond surface usage
- Learn content-addressable storage systems
- Implement binary encoding and decoding
- Work with hashing and compression
- Build a CLI tool from scratch
- Understand DAG-based version history
=======
## 📦 Installation & Setup

```bash
git clone <your-repo-link>
cd git-object-engine

npm install
npm link
```

Now you can run:

```bash
git-object-engine <command>
```

---

## 📚 Learning Objectives

This project helps you:

* Understand Git beyond surface-level usage
* Learn content-addressable storage systems
* Work with hashing and compression
* Implement binary encoding/decoding
* Build CLI tools from scratch
* Understand DAG-based version history
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

---

## ⚠️ Limitations

This is an educational implementation and does not include:

<<<<<<< HEAD
- Branch management
- Checkout
- Merge handling
- Pack files
- Reflog
- Advanced index format
=======
* Branching
* Checkout
* Merge handling
* Packfiles
* Reflog
* Advanced index format
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c

---

## 👨‍💻 Author

<<<<<<< HEAD
Aryan Sharma  
Software Engineering  
=======
**Aryan Sharma**
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
Delhi Technological University

---

## 📌 Why This Project Matters

<<<<<<< HEAD
Most developers know how to *use* Git.

Very few understand how Git actually works internally.

This project bridges that gap.
=======
Most developers know how to use Git.

Very few understand how Git actually works internally.

👉 This project bridges that gap.
>>>>>>> 13fecb555cf248f8b10083346c3c5e1a0c73ab3c
