const { promisify } = require("util");
const crypto = require("crypto");

const Account = require("../models/accountModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const twilio = require("twilio");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECERT, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const sendSMS = async (otp, phone) => {
  // Ensure the phone number starts with '+91' for India
  const formattedPhone = phone.startsWith("+91") ? phone : "+91" + phone;

  const client = new twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  return client.messages
    .create({
      body: `Please verify the account \n Your otp is ${otp} `,
      from: "+1 806 541 4777",
      to: formattedPhone,
    })
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
};

exports.createAccount = async (req, res, next) => {
  try {
    const account = await Account.create(req.body);

    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Account not created",
      });
    }

    const token = signToken(account._id);

    account.validateOtp();

    if (account.phone) {
      await sendSMS(account.otp, account.phone);
    }

    await account.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "Success",
      message: "Account created successfully",
      token,
      data: account,
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: "Account not created",
      reason: err,
    });
  }
};

exports.verifyAccount = async (req, res, next) => {
  try {
    const { email, phone } = req.query;
    const { otp } = req.body;

    console.log(email, phone);

    // Construct the query object based on provided email or phone
    let query = {};
    if (email) {
      query.email = email;
    }
    if (phone) {
      query.phone = phone;
    }

    const account = await Account.findOne(query).select(
      "otp otpExpires isVerified"
    );

    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Account not present",
      });
    }

    if (account.otp !== otp || account.otpExpires < Date.now()) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP or OTP has expired",
      });
    }

    if (account.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "Account already verified",
      });
    }

    account.isVerified = true;
    account.otpExpires = undefined;
    account.otp = undefined;

    await account.save();

    res.status(200).json({
      status: "success",
      message: "Account verified successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Cannot verify the account",
      reason: err.message,
    });
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.query;
    const { otp } = req.body;

    console.log(email, phone);

    // Construct the query object based on provided email or phone
    let query = {};
    if (email) {
      query.email = email;
    }
    if (phone) {
      query.phone = phone;
    }

    const account = await Account.findOne(query);

    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Account not present",
      });
    }

    // Generate new OTP and set new expiry time
    account.otp = Math.floor(100000 + Math.random() * 900000);
    account.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP expires after 2 minutes

    await account.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      status: "success",
      message: "OTP resent successfully",
      data: {
        otp: account.otp,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: "Cannot resend OTP",
      reason: err,
    });
  }
};

exports.loginAccount = async (req, res, next) => {
  const { email = "", password = "", phone = "" } = req.body;

  const { adminSecert } = req.query;

  let isAdmin = false;

  if (adminSecert && adminSecert === process.env.ADMIN_SECERT) isAdmin = true;

  let account;

  if (isAdmin) {
    account = await Account.findOne({
      email,
      phone,
    }).select("+password +role");
  } else {
    account = await Account.findOne({
      email,
      phone,
    }).select("+password +role");
  }

  if (
    !account ||
    !(await account.correctPassword(password, account.password))
  ) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  console.log("Account Id " + account._id);

  if (!account.isVerified) {
    return res.status(401).json({
      status: "error",
      message: "Account is not verified",
    });
  }

  if (isAdmin) {
    account.role = "admin";
    await account.save({ validateBeforeSave: false });
  }

  const token = signToken(account._id);

  res.status(200).json({
    status: "success",
    message: "Account LogIn Successfully",
    greeting: `Welcome ${account.firstName} ${
      account.role === "admin" ? "admin 💀" : ""
    }`,
    token,
  });
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const account = await Account.findOne({ email });

  if (!account) {
    return new AppError("There is no account with this email address", 404);
  }

  const resetToken = await account.createPasswordResetToken();

  await account.save({ validateBeforeSave: false });

  const url = `http://127.0.0.1:3500/api/v3/account/resetPassword/${resetToken}`;

  await new Email(account.email, url).resetPassword();

  res.status(200).json({
    status: "Success",
    message: "Mail send the your inbox",
  });
});

exports.resetPassword = async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log("Hashed Token " + hashToken);

  const account = await Account.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  if (!account) {
    return res.status(404).json({
      status: "error",
      message: "Token is invalid or Expired ",
    });
  }

  account.password = req.body.password;
  account.confirmPassword = req.body.confirmPassword;

  account.passwordResetToken = undefined;
  account.passwordResetExpires = undefined;
  account.passwordChangedAt = Date.now();

  await account.save({ validateBeforeSave: true });

  const token = signToken(account._id);

  res.status(200).json({
    status: "success",
    data: account,
    token,
  });
};

exports.updateAccount = async (req, res, next) => {
  const updateAccount = await Account.findByIdAndUpdate(
    req.params.accountId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updateAccount) {
    return res.status(404).json({
      status: "error",
      message: "Error while updating data",
    });
  }
  res.status(200).json({
    status: "success",
    data: updateAccount,
  });
};

exports.getAllAccount = async (req, res, next) => {
  try {
    const accounts = await Account.find();

    if (!accounts) {
      return res.status(404).json({
        status: "error",
        message: "Error while getting data",
      });
    }

    res.status(200).json({
      status: "success",
      length: accounts.length,
      data: accounts,
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECERT);

    const freshUser = await Account.findById(decoded.id);

    if (!freshUser) {
      return res.status(401).json({
        status: "error",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    // ? User have changed his/her password

    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "error",
        message: "User recently changed password! Please log in again.",
      });
    }

    req.account = freshUser;

    next();
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.account.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
