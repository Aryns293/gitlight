#!/usr/bin/env node

const GitClient = require("./git/client");
const {
  InitCommand,
  AddCommand,
  HashObjectCommand,
  CatFileCommand,
  WriteTreeCommand,
  CommitTreeCommand,
  LsTreeCommand,
  LogCommand,
  DiffCommand
} = require("./git/commands");

const command = process.argv[2];
const gitClient = new GitClient();

try {
  switch (command) {
    case "init":
      gitClient.run(new InitCommand());
      break;
    case "add":
      gitClient.run(new AddCommand(process.argv[3]));
      break;
    case "hash-object":
      gitClient.run(new HashObjectCommand(process.argv[3], process.argv[4]));
      break;
    case "cat-file":
      gitClient.run(new CatFileCommand(process.argv[3], process.argv[4]));
      break;
    case "write-tree":
      gitClient.run(new WriteTreeCommand());
      break;
    case "commit-tree":
      gitClient.run(
        new CommitTreeCommand(
          process.argv[3],
          process.argv[4],
          process.argv[5]
        )
      );
      break;
    case "diff":
      gitClient.run(new DiffCommand(process.argv[3], process.argv[4]));
      break;
    case "ls-tree":
    if(process.argv.length === 4) {
        gitClient.run(new LsTreeCommand(null, process.argv[3]));
    } else {
        gitClient.run(new LsTreeCommand(process.argv[3], process.argv[4]));
    }
    break;
    case "log":
      gitClient.run(new LogCommand(process.argv[3]));
      break;
    default:
      console.error("Unknown command");
      process.exit(1);
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}