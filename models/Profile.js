const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
//Ono sto je u User (avatar, id, email, name) hocemo da asociramo sa Profile, i dodamo i ostalo sto nema u User
// Asocirace User-a preko ID-ja
const ProfileSchema = new Schema({
  user: { //ovo user sadrzi _id, name i avatar iz users kolekcije
    type: Schema.Types.ObjectId, //preko ovog id-ja ja msm da se i ostalo izvodi iz users kolekcije
    ref: 'users' //reference the collection (jedina u DB je users)
  },
  handle: { //  www.sajt.com/profile/mikro <- da bi mogao da ima takav seo friendly url for profile
    type: String,
    required: true, //radicemo validation za profile, ali ipak cemo staviti required
    max: 40 //imacemo dvostruki validation, ovo (mongoose) i validation/profile koji ce biti elegantniji sa porukama
  },
  company: {
    type: String //nije required jer mozda nemaju kompaniju
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true //moci ce da izaberu: junior, senior, itd... 
  },
  skills: {
    type: [String], //u mongoose, Array of Strings
    required: true
  },
  bio: {
    type: String
  },
  githubusername: {
    type: String
  },
  experience: [ //Array of Objects
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [ //Array of Objects (rekao bih jedan clan i to json objekat)
    {
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldofstudy: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);