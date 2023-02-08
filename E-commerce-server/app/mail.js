const nodemailer=require('nodemailer')
const transport=nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.appMail,
        pass:process.env.appMailPass
    }
})
module.exports.sendmail=(email,subject,html)=>{
  transport.sendMail({
    from: process.env.appMail,
    to: email,
    subject,
    html,
  }).catch(err => console.log(err));
};
  