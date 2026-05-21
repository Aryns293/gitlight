const InitCommand = require("./init");
const AddCommand = require("./add");
const HashObjectCommand = require("./hash-object");
const CatFileCommand = require("./cat-file");
const WriteTreeCommand = require("./write-tree");
const CommitTreeCommand = require("./commit-tree");
const LsTreeCommand = require("./ls-tree");
const LogCommand = require("./log");
const DiffCommand = require("./diff");

module.exports = {
  InitCommand,
  AddCommand,
  HashObjectCommand,
  CatFileCommand,
  WriteTreeCommand,
  CommitTreeCommand,
  LsTreeCommand,
  LogCommand,
  DiffCommand
};