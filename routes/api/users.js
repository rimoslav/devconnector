const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); //preuzmemo avatar sa email-a
const bcrypt = require("bcryptjs"); //da hashujemo (kriptujemo) sifru
const jwt = require("jsonwebtoken"); //da generise token
const keys = require("../../config/keys"); //samo zbog secretOrKey, koji nam treba za jwt.sign
const passport = require("passport"); //passport jer radimo authentication

// Za register mi treba samo bctyptjs da hash-ujem pass. jsonwebtoken mi treba za login (pravi token) Passport i Passport-JWT za current (validira token). Token ne sadrzi password, samo id, name i email.

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User"); //ukljucili smo User.js pa mozemo da ga koristimo dole, i sve mongoose metode koji postoje

// @route  GET api/users/test
// @desc   Tests users route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users Works"
  })
); //router.get je isto kao za server.js app.get

// @route  POST api/users/register
// @desc   Register user
// @access Public
router.post("/register", (req, res) => {
  const {
    //Ovo cemo izvlaciti iz one funkcije za skoro svaku rutu koja prima podatke
    errors,
    isValid
  } = validateRegisterInput(req.body); // iz register.js, provjerava sve unosne podatke (name, email, pass...)

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors); // ako je manje od 2 ili vise od 30 vraca gresku: "Sifra mora biti..."
  }

  User.findOne({
    //User je User model, importovan gore i dodijeljen promjenljivoj User
    email: req.body.email //trazi email: ako ga ima. form input name ce biti email, zato req.body.email
  }) //sa mongoose moze da koristis callbacks i promises, ostacemo na promises, zato then
    .then(user => {
      //malo user jer je veliko User.findOne - dokumentacija za mongoose
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
      } else {
        //iz dokumentacije: gravatar.url(email, {velicina, rating, default})
        const avatar = gravatar.url(req.body.email, {
          s: "200",
          r: "pg", //kao u filmovima, r, pg, pg-13...
          d: "mm" //default je prazan avatar nacrtan, da ne bude skroz prazno, to je ovo mm
        });

        const newUser = new User({
          name: req.body.name, //req.body jer ce to doci iz form-e (html form)
          email: req.body.email, //zahvaljujuci body-parser
          avatar, //jer je avatar: avatar u ES6 dozvoljeno samo avatar. to je avatar odozgo
          password: req.body.password
        }); //kad pravis resurs sa mongoose, kazes new imeModela ({podaci kao objekat})

        bcrypt.genSalt(10, (err, salt) => {
          //prvo generisemo salt. dace nam salt, kad ga dobijemo
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //koristimo ga ovde da hash-ujemo pass
            if (err) throw err;
            newUser.password = hash; //newUser.pass je obican txt, sad ga podesi da bude hash (onaj iznad)
            newUser
              .save() //.save() is an instance method of the model (mongoose)
              .then(user => res.json(user)) //kad uradimo newUser.save() dobijamo ovog user => kao promise
              .catch(err => console.log(err)); // a onda ga samo res.json-ujemo
          }); //newUser.pass uzimamo iz forma, a ovo hash cemo da cuvamo u db
        }); //10 karaktera, callback. pitamo za gresku, a vratice nam salt, kad ga dobijemo, onda hash-ujemo pass
      }
    }); //mongoose method. //sad saljemo zahtjev kroz postman, posle ce biti kroz form u react-u
});

// @route  GET api/users/login
// @desc   Login User / Returning JWT Token
// @access Public

// Kad se user loginuje (verifikovan email i password), dobice nazad token koji ce se napraviti koristeci jsonwebtoken modul. I onda mogu da ga salju da pristupe zasticenoj ruti. I taj token koji user posalje ce biti verifikovan koristeci passport i passport-jwt. Dakle jsonwebtoken pravi token, passport ga validira i vadi podatke iz njega

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body); // iz login.js, provjerava email i pass samo

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors); // ako je manje od 2 ili vise od 30 vraca gresku: "Sifra mora biti..."
  }

  const email = req.body.email; //u loginu unosimo email i password. ako su tacni podaci, onda ostale podatke:
  const password = req.body.password; //id, name, avatar vadimo iz user.id, user.name, a to je ovaj dole ispod user

  //Find user by email
  User.findOne({
    email
  }).then(user => {
    //ovaj user, iz njega crpimo ostale podatke
    //Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check password, compare txt from form - password, and hashed pass in database - user.password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }; // Create JWT Payload, mos unutra sta hos ubacit, user nam je dat gore: .then(user =>)

        // Sign Token
        jwt.sign(
          payload, //payload je ono sto hocemo da ukljucimo u token. a to su podaci o user-u, jer kad se taj token posalje serveru hocemo da ga server dekodira i da zna koji je to user
          keys.secretOrKey,
          {
            expiresIn: 3600
          },
          (err, token) => {
            res.json({
              //Mozes dobiti sta hoces, ovde dobijamo success i sam token uz rijec Bearer
              success: true, // Nakon validnog logina sa servera dobijamo token (i ovo success)
              token: "Bearer " + token // Taj token stavljamo u header kao authorization (za /current rutu)
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route  GET api/users/current
// @desc   Return current user (whoever the token belongs to)
// @access Private
// Mislim da unutar passport.js imamo funkciju od passport koju koristimo kao auth, a ovdje je samo pozivamo
// Ovde mi u sustini radimo validate user-a (koristeci passport.js) i pravimo pristup zasticenoj ruti
router.get(
  "/current",
  passport.authenticate("jwt", {
    //jwt je strategija, zato je prvi parametar
    session: false
  }),
  (req, res) => {
    //unutar ovog req imamo req.user, a to je zahvaljujuci return done(null, user) u passport.js
    res.json({
      //ne ispisujemo pass, avatar, kad istice itd... samo ovo troje:
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }); //da stavimo samo req.user dobili bi sve ispisano u json-u, cak i kriptovan pass
  }
);

module.exports = router; //moramo da eksportujemo router da bi ga uhvatio server.js
