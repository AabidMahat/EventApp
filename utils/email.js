const nodemailer = require("nodemailer");
const pug = require("pug");
require("dotenv").config();

const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(email, url) {
    this.to = email;
    this.url = url;
    this.from = `Aabid Mahat ${process.env.EMAIL_FROM}`;
  }
  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  //send the actual mail

  async send(template, subject) {
    //1) Render HTML based on a pug template

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      url: this.url,
      subject,
    });

    //2) Define the email option

    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    //3) create a transport
    await this.newTransport().sendMail(mailOption);
  }

  async signUpUser() {
    await this.send("signUp", "Your Verification mail (Valid for 10mins)");
  }
  async resetPassword() {
    await this.send(
      "resetPassword",
      "Your Reset Password mail (Valid for 10mins)"
    );
  }
};
