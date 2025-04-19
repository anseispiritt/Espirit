const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();

// Your client ID and secret
const CLIENT_ID = '1362597204891795456';
const CLIENT_SECRET = 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR';
const REDIRECT_URI = 'https://espirit.onrender.com/callback'; // your render URL

app.use(session({
  secret: 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR', // Use your secret key here
  resave: false,
  saveUninitialized: true
}));

// Serve static files (like index.html) in the public directory
app.use(express.static('public'));

// Callback route to handle OAuth response
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Get the access token using the authorization code
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      scope: 'identify email'
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Get the user details from Discord API
    const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Store the user data in the session
    req.session.user = userResponse.data;

    // Redirect to the homepage (index.html)
    res.redirect('/');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.send('OAuth failed');
  }
});

// Home page route (index.html)
app.get('/', (req, res) => {
  if (req.session.user) {
    // If the user is logged in, render the index page with user info
    res.send(`
      <html>
        <head>
          <title>Espirit</title>
          <link rel="stylesheet" href="styles.css"> <!-- Add your custom styles here -->
        </head>
        <body>
          <div>
            <img src="https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png" alt="User Avatar" width="50" height="50">
            <p>Welcome, ${req.session.user.username}!</p>
            <a href="/logout">Logout</a>
          </div>
        </body>
      </html>
    `);
  } else {
    // If not logged in, show the login button
    res.send(`
      <html>
        <head>
          <title>Espirit</title>
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <div>
            <a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=identify+email">Login with Discord</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Failed to logout');
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('OAuth server running at http://localhost:3000');
});
