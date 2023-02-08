const nodemailer=require('nodemailer')
const transport=nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.appMail,
        pass:process.env.appMailPass
    }
})
module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log(process.env.appMailPass);
    transport.sendMail({
      from: process.env.appMail,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/ecommerce/user/confirm/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  };
  module.exports.sendCartConfirmationEmail = (cart,confirmationCode) => {
    console.log('hhhhh')
    transport.sendMail({
      from: process.env.appMail,
      to: cart.email,
      subject: "Please confirm your cart",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${cart.fullname}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/ecommerce/cart/callbackcartconfirm/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  }; module.exports.sendCartStatusEmail = (cart) => {
    console.log('hhhhh')
    transport.sendMail({
      from: process.env.appMail,
      to: cart.email,
      subject: "Please confirm your cart",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${cart.fullname}</h2>
          <p>we need to inform you that your cart <h4>${cart.status}</h4></p>
          ${cart.status=='in it`s way'?'wait our representative soon':'please inform us with your review or any complain'}
          </div>`,
    }).catch(err => console.log(err));
  };
  module.exports.sendResetPassEmail=(name, email,token) => {
    console.log(process.env.appMailPass);
    transport.sendMail({
      from: process.env.appMail,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email for reset your password</h1>
          <h2>Hello ${name}</h2>
          <form method="post" action="http://localhost:3000/ecommerce/user/forgetpass/changepass/${token}">
		<div><label for="email">your email</label>: <input value='${email}' style=" display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.5;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	border-radius: 0.375rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	" type="email" name="email" id="email" required></div>
		<div><label for="password">enter your new password</label>: <input style=" display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.5;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	border-radius: 0.375rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	" type="password" name="password" id="password" required
				pattern='(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'></div>
		<div><input style="
		background-color:#0d6efd ; color: #fff;
  --bs-btn-bg: #0d6efd;
  border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0b5ed7;
  --bs-btn-hover-border-color: #0a58ca;
  --bs-btn-focus-shadow-rgb: 49, 132, 253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0a58ca;
  --bs-btn-active-border-color: #0a53be;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;" type="submit" value="submit"></div>
	</form></div>`,
    }).catch(err => console.log(err));
}