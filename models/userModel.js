const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    require: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  passsword: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: 8,
  },
  passswordConfirm: {
    type: String,
    require: [true, 'please confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
