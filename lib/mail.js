'use strict';

// require packages
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// require configs
const debug = require('./debug.js');
const mailConfig = require('./../config/mail.js');

//OAuth 
const OAuth2Client = new OAuth2(
    mailConfig.clientId, mailConfig.clientSecret, mailConfig.redirectUri
  );

OAuth2Client.setCredentials({ refresh_token: mailConfig.refreshToken });

// access token
const accessToken =  OAuth2Client.getAccessToken();

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
//   host: mailConfig.host,
//   port: 465,
//   // true for 465, false for other ports
//   secure: true,
//   ignoreTLS: true,
//   requireTLS: false,
  auth: {
    type: 'OAuth2',
    user: mailConfig.user,
    clientId: mailConfig.clientId,
    clientSecret: mailConfig.clientSecret,
    refreshToken: mailConfig.refreshToken,
    accessToken: accessToken,
  },
});

/**
 * @desc create signed token.
 * @param {array} params.receiversEmail - array of receivers emails.
 * @param {string} params.subject - subject of the mail.
 * @param {string} params.text - text content for the mail.
 * @param {string} params.html - html content for the mail.
 * @param {array} params.attachements - file attachements for the mail.
 * @returns {string} messageId.
 */
const send = async params => {
  try {

    // send mail with defined transport object
    const mailObj = {
      // sender address
      from: 'seatorder <noreply@seatorder.com>',
      // list of receivers
      to: params.to.join(', '),
      // Subject line
      subject: params.subject
    };
    // text
    if (Object.hasOwn(params, 'text')) mailObj.text = params.text;
    // html body
    if (Object.hasOwn(params, 'html')) mailObj.html = params.html;
    // attachements
    if (Object.hasOwn(params, 'attachments')) mailObj.attachments = params.attachments;
    const info = await transporter.sendMail(mailObj);
    debug.mail(info.messageId);
    return info.messageId;
  } catch (err) {
    debug.mail(err);
    return '';
  }
};

module.exports = {
  send
};
