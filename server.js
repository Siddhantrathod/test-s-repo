const express = require('express');
const app = express();
const port = 3000;
const config = require('./config');

// Intentional SAST issues: potentially dangerous functions
app.get('/', (req, res) => {
  res.send('Welcome to the Sentinelops target application! This app is intentionally vulnerable.');
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

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
