const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const helper = require("../helper");
const emailTemplateModel = require("../models/emailTemplate");
const authFile = require("../middleware/auth");

exports.signup = async (req, res) => {
  let reqBody = req.body;
  let name = reqBody?.name;
  let email = reqBody?.email;
  let phone = reqBody?.phone;
  let isAdmin = reqBody?.isAdmin;

  try {
    let [existingEmail, existingPhone] = await Promise.all([
      userModel.findOne({ email: email }),
      userModel.findOne({ phone: phone }),
    ]);
    
    if (existingEmail) {
      return res.json({
        success: false,
        message: "The provided email address is already registered."
      });
    }
    
    if (existingPhone) {
      return res.json({
        success: false,
        message: "The provided phone number is already associated with an existing account."
      });
    }    

    // let OTP = Math.floor(100000 + Math.random() * 900000);
    let OTP = 123456;
    console.log(OTP);

    let user = new userModel({
      name: name,
      email: email,
      phone: phone,
      isAdmin: isAdmin,
      isActive: false,
      otp: OTP.toString(),
    });

    let savedData = await user.save();

    res.json({
      success: true,
      data: {
        _id: savedData._id,
        name: savedData.name,
        isActive: false,
        isAccountVerified: false,
        email: savedData.email,
        isAdmin: savedData.isAdmin,
      },
    });

    // let userOTPTemplate = await emailTemplateModel.findOne({ name: "USER_SIGNUP_OTP" });
    // let content = eval("`" + userOTPTemplate.content + "`");
    let subject = "Verification OTP";

    // helper.sendEmail(email, subject, content)

  } catch (err) {
    console.log("Error in userSignup: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!. PLease try again later"
    });
  }
};

exports.verifySignup = async (req, res) => {
  let reqBody = req.body;
  let userId = reqBody.userId;
  let otp = reqBody.otp;
  try {
    let userData = await userModel.findById(userId);

    if (userData?.otp !== otp) {
      return res.json({
        success: false,
        message: "Please enter correct OTP!"
      });
    }

    if (userData.isAccountVerified) {
      return res.json({
        success: true,
        message: "Your account has already been verified. Please sign in using your registered email address."
      });
    }    

    userData.otp = null;
    userData.isActive = true;
    userData.isAccountVerified = true;
    await userData.save();
    // let userSignupSuccessTemplate = await emailTemplateModel.findOne({ name: "USER_SIGNUP_SUCCESS" });
    // let content = eval("`" + userSignupSuccessTemplate.content + "`");
    let subject = "Signup Successfully!";

    // helper.sendEmail(userData?.email, subject, content);
    let accessToken = await authFile.generateToken(userData);

    return res.json({
      success: true,
      message: "Signup successful",
      accessToken: accessToken,
      data: {
        _id: userData._id,
        isAccountVerified: userData.isAccountVerified,
        isActive: userData.isActive,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      }
    });

  } catch (err) {
    console.log("Error in userVerifyOtp: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!. PLease try again later"
    });
  }
};

exports.signin = async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found!. Please check your email"
      });
    }

    if (!user.isActive) {
      return res.json({
        success: false,
        message: "Please complete signup before login!"
      });
    }

    // let OTP = Math.floor(100000 + Math.random() * 900000);
    let OTP = 123456;
    console.log(OTP)

    user.otp = OTP.toString(); 
    let userData = await user.save();

    // let userOTPTemplate = await emailTemplateModel.findOne({ name: "USER_SIGNIN_OTP" });
    // let content = eval("`" + userOTPTemplate.content + "`");
    let subject = "Verification OTP";

    // helper.sendEmail(user?.email, subject, content);

    res.json({
      success: true,
      message: "OTP sent successful.",
      data: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      }
    });

  } catch (err) {
    console.log("Error in user:", err);
    res.json({
      success: false,
      message: "Internal Server Error!. Please try again later."
    });
  }
};

exports.verifySignin = async (req, res) => {
  let reqBody = req.body;
  let userId = reqBody.userId;
  let otp = reqBody.otp;
  try {
    let userData = await userModel.findById(userId);

    if (userData?.otp !== otp) {
      return res.json({
        success: false,
        message: "Please enter correct OTP!"
      });
    }

    userData.otp = null;
    await userData.save();

    let accessToken = await authFile.generateToken(userData);

    return res.json({
      success: true,
      message: "Login Successful",
      accessToken: accessToken,
      data: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      },
    });

  } catch (err) {
    console.log("Error in userVerifyOtp: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!. PLease try again later"
    });
  }
};

module.exports = exports;
