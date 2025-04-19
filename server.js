const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: 'espiritSecret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: '1362597204891795456',
  clientSecret: 'qcAmq2XmJnPL225qupHVK7J8POuPM2SR',
  callbackURL: 'https://espirit.onrender.com/callback',
  scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  return done(null, profile);
}));

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/index.html');
});

app.get('/user', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('http://127.0.0.1:5500/website/index.html'); // Update if using a different URL
    });
  });
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`OAuth server running at http://localhost:${PORT}`);
});
