//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "a secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("login");
  }
});

app.post("/register", function(req, res) {


  let userName = req.body.username;
  let passWord = req.body.password;

  User.register({username: userName}, passWord, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("secrets");
      });
    }
  })

  // bcrypt.hash(password, saltRounds, function(err, hash) {
  //   let newUser = new User({
  //     email: userName,
  //     password: hash
  //   });
  //
  //   newUser.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   })
  // });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
})

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
    username: username,
    password: password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("secrets");
      })
    }
  })
});

app.listen(3000, function() {
  console.log("Server listening on port 3000");
});
