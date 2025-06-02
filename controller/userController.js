const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

//userHandler
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND REPONSE
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route yet to defined!',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route yet to defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route yet to defined!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route yet to defined!',
  });
};
