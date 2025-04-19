// server.js

const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const app = express();

// Replace with your actual Discord client ID, client secret, and redirect URI
const CLIENT_ID = '1362597204891795456';
const CLIENT_SECRET = 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR';
const REDIRECT_URI = 'https://espirit.onrender.com/callback';

// Session middleware
app.use(
  session({
    secret: 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR', // Keep this secret safe
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to initiate Discord OAuth2 authentication with email scope
app.get('/auth/discord', (req, res) => {
  const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify+email`; // Added email scope
  res.redirect(authorizeUrl);
});

// Callback route for Discord OAuth2
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/');

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify+email', // Include email scope
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user information
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Fetch email
    const emailResponse = await axios.get('https://discord.com/api/v9/users/@me/email', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Combine user info and email
    const userData = {
      ...userResponse.data,
      email: emailResponse.data.email, // Add email to user data
    };

    // Store user information in session
    req.session.user = userData;
    res.redirect('/');
  } catch (error) {
    console.error('Error during Discord OAuth2 callback:', error);
    res.redirect('/');
  }
});

// Route to get user information
app.get('/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.json({});
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
