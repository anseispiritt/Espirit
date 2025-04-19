const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace these with your actual Discord app credentials
const CLIENT_ID = '1362597204891795456';
const CLIENT_SECRET = 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR';
const REDIRECT_URI = 'https://espirit.onrender.com/callback';

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(__dirname)); // Serve index.html, style.css, etc. from root

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth/discord', (req, res) => {
  const scope = ['identify', 'email'].join(' ');
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(redirect);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/');

  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('scope', 'identify email');

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const access_token = tokenRes.data.access_token;
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    req.session.user = userRes.data;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Error during OAuth');
  }
});

app.get('/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
