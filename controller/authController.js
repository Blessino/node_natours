const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
    // passwordChangedAt: req.body.passwordChangedAt,
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
  const freshUser = await User.findById(decoded.id);
  console.log(freshUser.passwordChangedAt);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exits.',
        401,
      ),
    );
  }

  //Checking if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUT
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have a permission to perform this action',
          403,
        ),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Getting user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email address', 400));
  }

  //Generating random  reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Sending it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Submit a PATCH request with your new password and passwordComfirm to: ${resetURL}.\nIf you didn't forget your password, Please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'sucess',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('THere was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = (req, res, next) => {};
