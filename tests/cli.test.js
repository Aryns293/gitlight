const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('GitLight CLI', () => {
  let testDir;
  const gitlightPath = path.resolve(__dirname, '../app/main.js');

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitlight-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  function run(command) {
    return execSync(`node ${gitlightPath} ${command}`, { encoding: 'utf-8' }).trim();
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

  test('add stages files into the index', () => {
    run('init');
    fs.writeFileSync('test.txt', 'hello world');
    run('add test.txt');
    
    expect(fs.existsSync('.git/index.json')).toBe(true);
    const index = JSON.parse(fs.readFileSync('.git/index.json', 'utf-8'));
    expect(index['test.txt']).toBe('95d09f2b10159347eece71399a7e2e907ea3df4f');
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
    expect(fs.existsSync(commitObjectPath)).toBe(true);
  });
});
