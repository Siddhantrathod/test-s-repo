const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const serialize = require('node-serialize');
const app = express();
const port = 3000;
const config = require('./config');

const DB_PATH = '/tmp/vuln_node.db';
const DATA_ROOT = '/var/data-node';

function initDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)');
    db.run('DELETE FROM items');
    db.run("INSERT INTO items (name) VALUES ('alpha'), ('beta'), ('gamma')");
  });
  db.close();
}

// Intentional SAST issues: potentially dangerous functions
app.get('/', (req, res) => {
  res.send(
    "<h1>Sentinelops target application</h1>" +
      "<ul>" +
      "<li><a href='/search?q=alpha'>/search?q=alpha</a></li>" +
      "<li><a href='/eval?code=2%2b2'>/eval?code=2+2</a></li>" +
      "<li><a href='/auth?token=super-secret-jwt-key-do-not-share'>/auth</a></li>" +
      "<li><a href='/sqli?q=alpha'>/sqli?q=alpha</a></li>" +
      "<li><a href='/cmd?cmd=id'>/cmd?cmd=id</a></li>" +
      "<li><a href='/path?path=example.txt'>/path?path=example.txt</a></li>" +
      "<li><a href='/deserialize?data='>/deserialize?data=</a></li>" +
      "<li><a href='/md5?pw=secret'>/md5?pw=secret</a></li>" +
      "</ul>"
  );
});

// A route that could be vulnerable to XSS for DAST
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  // Vulnerable to Reflected XSS
  res.send(`<h1>Search Results for: ${query}</h1>`);
});

// A route simulating a dangerous eval (SAST bait)
app.get('/eval', (req, res) => {
  const code = req.query.code || 'console.log("no code")';
  try {
    // Very dangerous!
    eval(code);
    res.send('Code executed!');
  } catch (err) {
    res.send('Error executing code');
  }
});

// Using a hardcoded secret in logic intentionally
app.get('/auth', (req, res) => {
  if (req.query.token === config.jwtSecret) {
    res.send('Authenticated!');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.get('/sqli', (req, res) => {
  const q = req.query.q || '';
  const sql = `SELECT name FROM items WHERE name LIKE '%${q}%'`; // SQLi
  const db = new sqlite3.Database(DB_PATH);
  db.all(sql, (err, rows) => {
    db.close();
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ query: q, rows });
  });
});

app.get('/cmd', (req, res) => {
  const cmd = req.query.cmd || 'id';
  childProcess.exec(cmd, (err, stdout, stderr) => {
    res.send(`${stdout}${stderr}`);
  });
});

app.get('/path', (req, res) => {
  const userPath = req.query.path || 'example.txt';
  const target = path.join(DATA_ROOT, userPath);
  const content = fs.readFileSync(target, 'utf-8');
  res.send(content);
});

app.get('/deserialize', (req, res) => {
  const payload =
    req.query.data || '{"rce":"_$$ND_FUNC$$_function(){return process.version}()"}';
  try {
    const obj = serialize.unserialize(payload);
    res.json({ loaded: obj });
  } catch (err) {
    res.status(400).send('Error deserializing data');
  }
});

app.get('/md5', (req, res) => {
  const pw = req.query.pw || '';
  const digest = crypto.createHash('md5').update(pw).digest('hex');
  res.json({ md5: digest });
});

app.listen(port, () => {
  fs.mkdirSync(DATA_ROOT, { recursive: true });
  fs.writeFileSync(path.join(DATA_ROOT, 'example.txt'), 'example data');
  initDb();
  console.log(`App running at http://localhost:${port}`);
});
