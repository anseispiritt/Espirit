const express = require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = '1362597204891795456';
const CLIENT_SECRET = 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR';
const REDIRECT_URI = 'https://espirit.onrender.com/callback';
const DISCORD_API_URL = 'https://discord.com/api/v10';

app.use(cookieParser());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the index.html file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OAuth - Redirect to Discord's authorization URL
app.get('/auth/discord', (req, res) => {
  const redirectUri = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify+email`;
  res.redirect(redirectUri);
});

// OAuth callback route
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Get the access token
    const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        scope: 'identify email',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // Use the access token to get user info
    const userResponse = await axios.get(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const user = userResponse.data;

    // Store user info in session
    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };

    res.redirect('/');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Route to get user info
app.get('/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
