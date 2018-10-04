const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // body-parser is a piece of express middleware that reads a form's input and stores it as a javascript object accessible through req.body (for HTTP Post request)
const passport = require("passport"); //ovdje je ukljucen glavni modul, passport. strategija je u config/passport.js, i to konkretno jwt strategija

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Body parser middleware
app.use(
  bodyParser.urlencoded({
    extended: false // istrazi razliku izmedju qs i querystring da izaberes true ili false
  })
);
app.use(bodyParser.json()); //ovo su 2 od 4 strategije, ima i .txt i .raw

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db, {
      useNewUrlParser: true
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Passport Middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Server running on port " + port));