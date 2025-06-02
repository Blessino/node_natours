const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //  const newUser = await User.create({req.body});

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Checking if email and password exit
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  //checking if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email and password', 401));
  }

  // console.log(user);

  //If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'sucess',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting token and checking it it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  //varification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //Checking if user still exists
  next();
});
