const email = require("nodemailer");

const config = require("./config").email;

const transporter = email.createTransport({
  service: 'QQ',
  port: 465, // SMTP 端口
  secureConnection: true, // 使用 SSL
  auth: config
});

function sendEmail(to, subject, body){
  const mailOptions = {
    from: config.user,
    to,
    subject,
    html:body
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent to '+ to +': ' + info.response);
  });
}

module.exports = {
  sendEmail
};

