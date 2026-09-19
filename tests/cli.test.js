const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('GitLight CLI', () => {
  let testDir;
  const gitlightPath = path.resolve(__dirname, '../app/main.js');
  const originalCwd = process.cwd();

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitlight-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  function run(command) {
    return execSync(`node ${gitlightPath} ${command}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  }

  test('init creates .git directory structure', () => {
    const output = run('init');
    expect(output).toContain('Initialized empty GitLight repository');
    expect(fs.existsSync('.git')).toBe(true);
    expect(fs.existsSync('.git/objects')).toBe(true);
    expect(fs.existsSync('.git/refs/heads')).toBe(true);
    expect(fs.existsSync('.git/HEAD')).toBe(true);
    const headContent = fs.readFileSync('.git/HEAD', 'utf-8');
    expect(headContent).toBe('ref: refs/heads/main\n');
  });

  test('hash-object computes correct SHA without writing', () => {
    fs.writeFileSync('test.txt', 'hello world');
    const output = run('hash-object test.txt');
    // SHA of "blob 11\0hello world"
    expect(output).toBe('95d09f2b10159347eece71399a7e2e907ea3df4f');
    expect(fs.existsSync('.git')).toBe(false); // Does not need repo to just hash
  });

  test('hash-object -w writes object to database', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    const output = run('hash-object -w test.txt');
    
    expect(output).toBe('95d09f2b10159347eece71399a7e2e907ea3df4f');
    const objectPath = path.join('.git', 'objects', '95', 'd09f2b10159347eece71399a7e2e907ea3df4f');
    expect(fs.existsSync(objectPath)).toBe(true);
  });

  test('hash-object rejects unknown flags', () => {
    fs.writeFileSync('test.txt', 'hello world');
    expect(() => run('hash-object --bad test.txt')).toThrow(/Unknown flag: --bad/);
  });

  test('add stages files into the index', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    const output = run('add test.txt');
    
    expect(fs.existsSync('.git/index.json')).toBe(true);
    const index = JSON.parse(fs.readFileSync('.git/index.json', 'utf-8'));
    expect(index['test.txt']).toBe('95d09f2b10159347eece71399a7e2e907ea3df4f');
    expect(output).toBe('Added test.txt');
  });

  test('commit creates tree and commit object', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    
    const output = run('commit -m "initial commit"');
    expect(output).toContain('[main');
    expect(output).toContain('] initial commit');
    
    const headSha = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();
    const commitObjectPath = path.join('.git', 'objects', headSha.slice(0, 2), headSha.slice(2));
    expect(fs.existsSync(commitObjectPath)).toBe(true);
  });

  test('a command run outside a repo fails fast with a clear error', () => {
    expect(() => run('add test.txt')).toThrow();
  });

  test('write-tree creates a tree object from the index, including nested folders', () => {
    run('init');
    fs.mkdirSync('src');
    fs.writeFileSync('file.txt', 'root file');
    fs.writeFileSync('src/index.js', "console.log('hi')");
    run('add file.txt');
    run('add src/index.js');

    const treeSha = run('write-tree');
    expect(treeSha).toMatch(/^[a-f0-9]{40}$/);
    const objectPath = path.join('.git', 'objects', treeSha.slice(0, 2), treeSha.slice(2));
    expect(fs.existsSync(objectPath)).toBe(true);

    // The nested src/ entry should itself be a real sub-tree object, not a
    // flat entry with a slash in the name.
    const lsOutput = run(`ls-tree ${treeSha}`);
    expect(lsOutput).toContain('tree');
    expect(lsOutput).toContain('src');
  });

  test('write-tree fails on an empty staging area', () => {
    run('init');
    expect(() => run('write-tree')).toThrow();
  });

  test('commit-tree creates a commit object and updates HEAD', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    const treeSha = run('write-tree');

    const commitSha = run(`commit-tree ${treeSha} "" "manual commit"`);
    expect(commitSha).toMatch(/^[a-f0-9]{40}$/);

    const headSha = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();
    expect(headSha).toBe(commitSha);
  });

  test('cat-file -t reports the correct type for blob, tree, and commit', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    const treeSha = run('write-tree');
    const commitSha = run(`commit-tree ${treeSha} "" "msg"`);

    expect(run('cat-file -t 95d09f2b10159347eece71399a7e2e907ea3df4f')).toBe('blob');
    expect(run(`cat-file -t ${treeSha}`)).toBe('tree');
    expect(run(`cat-file -t ${commitSha}`)).toBe('commit');
  });

  test('cat-file -p pretty-prints blob content and tree entries', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    const treeSha = run('write-tree');

    expect(run('cat-file -p 95d09f2b10159347eece71399a7e2e907ea3df4f')).toBe('hello world');

    const treeOutput = run(`cat-file -p ${treeSha}`);
    expect(treeOutput).toContain('blob');
    expect(treeOutput).toContain('test.txt');
  });

  test('cat-file rejects an unknown flag', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    expect(() => run('cat-file -x 95d09f2b10159347eece71399a7e2e907ea3df4f')).toThrow();
  });

  test('ls-tree lists entries with mode, type, and sha', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    const treeSha = run('write-tree');

    const output = run(`ls-tree ${treeSha}`);
    expect(output).toContain('100644');
    expect(output).toContain('blob');
    expect(output).toContain('95d09f2b10159347eece71399a7e2e907ea3df4f');
    expect(output).toContain('test.txt');
  });

  test('ls-tree --name-only lists just filenames', () => {
    run('init');
    fs.writeFileSync('a.txt', 'aaa');
    fs.writeFileSync('b.txt', 'bbb');
    run('add a.txt');
    run('add b.txt');
    const treeSha = run('write-tree');

    const output = run(`ls-tree --name-only ${treeSha}`);
    expect(output.split('\n').sort()).toEqual(['a.txt', 'b.txt']);
  });

  test('log prints commit history with author, date, and message', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    const commitOutput = run('commit -m "first commit"');
    const commitSha = commitOutput.match(/\[main ([a-f0-9]+)\]/)[1];

    const output = run('log');
    expect(output).toContain(`commit ${commitSha}`);
    expect(output).toContain('Author:');
    expect(output).toContain('Date:');
    expect(output).toContain('first commit');
  });

  test('log walks multiple commits back through the parent chain', () => {
    run('init');
    fs.writeFileSync('test.txt', 'v1');
    run('add test.txt');
    run('commit -m "first"');
    fs.writeFileSync('test.txt', 'v2');
    run('add test.txt');
    run('commit -m "second"');

    const output = run('log');
    expect(output).toContain('first');
    expect(output).toContain('second');
    expect(output.indexOf('second')).toBeLessThan(output.indexOf('first')); // newest first
  });

  test('diff shows added and removed lines between two commits', () => {
    run('init');
    fs.writeFileSync('test.txt', 'line one\nline two');
    run('add test.txt');
    run('commit -m "first"');
    const sha1 = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();

    fs.writeFileSync('test.txt', 'line one\nline three');
    run('add test.txt');
    run('commit -m "second"');
    const sha2 = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();

    const output = run(`diff ${sha1} ${sha2}`);
    expect(output).toContain('diff → test.txt');
    expect(output).toContain('- line two');
    expect(output).toContain('+ line three');
  });

  test('diff reports no differences for two identical commits', () => {
    run('init');
    fs.writeFileSync('test.txt', 'same content');
    run('add test.txt');
    run('commit -m "only commit"');
    const sha = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();

    const output = run(`diff ${sha} ${sha}`);
    expect(output).toBe('No differences found between commits.');
  });
});
