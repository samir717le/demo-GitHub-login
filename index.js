const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Store user profile data or perform other actions here
    return done(null, profile);
  }
));

// Serialize user into the session
passport.serializeUser(function(user, done) {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Routes
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.send(`<h1>Hello, ${req.user.username}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.send('<h1>Hello, Guest!</h1><a href="/auth/github">Login with GitHub</a>');
  }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
