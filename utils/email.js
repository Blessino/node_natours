const nodemailer = require('nodemailer');
const { options } = require('../routes/userRoutes');

const sendEmail = async (options) => {
  //creating a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmaile "less secure app" option
  });

  //Define the email options
  const mailOptions = {
    from: 'Ashish Chaudhary <test@gmail.io>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  //actually sending email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
