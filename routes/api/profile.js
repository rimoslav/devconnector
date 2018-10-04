const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load Profile Model
const Profile = require("../../models/Profile");
//Load User Model
const User = require("../../models/User");

// @route  GET api/profile/test
// @desc   Tests profile route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Profile Works"
  })
); //router.get je isto kao za server.js app.get

// @route  GET api/profile, ne treba /:id jer ce svaki user nakon logina imati seo friendly url za profil (api/profile/handle)
// @desc   Get current user profile
// @access Private
// Posto je ovo zasticena ruta, token ce da stavi korisnika u req.user
router.get(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const errors = {};

    Profile.findOne({
        user: req.user.id
      })
      .populate("user", ["name", "avatar"]) //populate ovaj gore user: sa name i avatar (_id vec ima)
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route  GET api/profile/all
// @desc   Get all profiles
// @access Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles yet";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err =>
      res.status(404).json({
        profile: "There are no profiles yet"
      })
    );
});

// @route  GET api/profile/handle/:handle (na front end bice bez srednjeg /handle)
// @desc   Get profile by handle
// @access Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({
      handle: req.params.handle
    }) // handle: je u db. req.params.handle = :handle ovo iznad
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID
// @access Public
// Razlika je, osim u URL-u, to sto ako ne postoji profil, kada trazimo preko nepostojeceg handle-a izbacuje nam errors gresku iz if(!profile), dok preko user_id izbacuje .catch(err)
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({
      user: req.params.user_id //necemo ulogovanog, nego ocemo kog god, ciji god id unesemo
    }) // user: je u db. req.params.user_id = :user_id ovo iznad
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: "There is no profile for this user"
      })
    );
});

// @route  POST api/profile
// @desc   Create or edit user profile
// @access Private
// Posto je ovo zasticena ruta, token ce da stavi korisnika u req.user
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateProfileInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    // Get fields
    const profileFields = {}; //sve podatke o useru stavicemo kao propertije objekta
    profileFields.user = req.user.id; //ukljucuje avatar, name i email
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - split into an Array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate({
          user: req.user.id
        }, {
          $set: profileFields
        }, {
          new: true
        }).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({
          handle: profileFields.handle
        }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route  POST api/profile/experience
// @desc   Add experience to profile
// @access Private
router.post(
  "/experience",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateExperienceInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({
      //hocemo da vrsimo pretragu prema ulogovanom user-u zato mozemo da kazemo prosto:
      user: req.user.id //sto dolazi iz tokena
    }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      // Nece experience biti Objekat za sebe, nego Array Objekata koji je sam po sebi property Profile Objekta
      // Add to experience Array
      profile.experience.unshift(newExp); //unshift je isto kao push za Array, samo sto lijepi na pocetku a ne na kraju Array-a

      profile.save().then(profile => res.json(profile)); //dodace experience i vratice profile sa novim experience
    }); //a u front end-u update-ovace state i vidjecemo novi experience
  }
);

// @route  POST api/profile/education
// @desc   Add education to profile
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateEducationInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({
      //hocemo da vrsimo pretragu prema ulogovanom user-u zato mozemo da kazemo prosto:
      user: req.user.id //sto dolazi iz tokena
    }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      // Nece education biti Objekat za sebe, nego Array Objekata koji je sam po sebi property Profile Objekta
      // Add to education Array
      profile.education.unshift(newEdu); //unshift je isto kao push za Array, samo sto lijepi na pocetku a ne na kraju Array-a

      profile.save().then(profile => res.json(profile)); //dodace education i vratice profile sa novim education
    }); //a u front end-u update-ovace state i vidjecemo novi education
  }
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {

    Profile.findOne({
      user: req.user.id //dolazi iz tokena
    }).then(profile => {
      // Get remove index
      const removeIndex = profile.experience //ovo je Array. map je metod viseg reda koji ti dozvoljava
        .map(item => item.id) //da mapujes Array na nesto drugo. Uzecemo item i mapovacemo ga na Array idem.id-ja, da imamo samo id-jeve
        .indexOf(req.params.exp_id); //Ovo nam daje tacan experience koji treba da izbrisemo. Dole ga moramo i izbrisati

      // Splice out of Array
      profile.experience.splice(removeIndex, 1); //Brisemo gore odredjeni experience

      // Save
      profile.save().then(profile => res.json(profile)); //posalji nazad apdejtovan profil koji smo dobli splice-om
    }).catch(err => res.status(404).json(err));
  }
);

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education from profile
// @access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {

    Profile.findOne({
      user: req.user.id //dolazi iz tokena
    }).then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // Splice out of Array
      profile.education.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => res.json(profile)); //posalji nazad apdejtovan profil koji smo dobli splice-om
    }).catch(err => res.status(404).json(err));
  }
);

// @route  DELETE api/profile
// @desc   Delete user and profile
// @access Private
router.delete(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOneAndRemove({
        user: req.user.id
      })
      .then(() => {
        User.findOneAndRemove({
          _id: req.user.id //posto je u users kolekciji ne ide user: nego _id:
        }).then(() => res.json({
          success: true
        })); //nebitno je sta ovde vracamo, nije ni neophodno
      });
  }
);

module.exports = router; //moramo da eksportujemo router da bi ga uhvatio server.js