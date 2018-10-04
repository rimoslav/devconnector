//passport ima mnogo pod-modula, jwt je samo jedan od njih. passport je glavi authetication module
//passport ima razlicite strategije, lokalnu, g-mail (google oath), jwt strategija...
//passport-jwt jer koristimo jsonwebtoken-e

//sve u ovom fajlu je passport-jwt. to je samo strategija
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt; //ovo ce nam omoguciti da extraktujemo payload (user data) i da radimo sa njim sta hocemo
const mongoose = require("mongoose");
const User = mongoose.model("users"); //to je u User modelu ono 'users' u zagradi
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //naglasavamo da koristimo Bearer token
opts.secretOrKey = keys.secretOrKey;
//Ovaj kod je pisan paralelno sa /current rutom
//Vadimo podatke iz tokena (nakon validnog logina, a kasnije to koristimo za /current rutu)
module.exports = passport => { // ovo =passport=> je ono u server.js ("./config/passport")(passport);
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => { //ovo jwt_payload treba da ima iste podatke kao i u users.js, 
      User.findById(jwt_payload.id) //onaj payload kad smo radili kriptovanje, id, name i avatar
        .then(user => { //plus pass, email, kad istice token i slicno.
          if (user) { //znaci da je user nadjen
            return done(null, user); //null, jer nema error-a, i vrati mi usera. to posle koristim u users.js
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    }) //jwt_payload je payload iz tokena, sadrzi id, ime i prezime, avatar, kad je nastao i kad istice
  );
}; // ili module.exports = (passport) =>, dok je ovo konkretno passport u stvari u server.js require('./config/passport')(passport) ovo poslednje passport.