const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  name: { //Mozemo da uradimo populate, ali ako user izbrise profile, nestace i ime. A mi zelimo da ostane kom
    type: String
  },
  avatar: {
    type: String
  },
  likes: [ //Array objekata, novi lajk - novi Objekat na listi: sadzi samo ID, povucen iz users kolekcije
    { //Kada user lajkuje, bice dodan u Array, da ne moze opet, ako povuce lajk, bice uklonjen sa spiska
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    text: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);