'use strict';

// require packages
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const crypto = require('crypto');
const snowflake = require('snowflake-id');

// require configs
const jwtConfig = require('./../config/jwt.js');
//const countriesYamlConfig = yaml.load(fs.readFileSync(path.resolve(__dirname, './../config/yml/countries.yml'), 'utf8'));

// require libraries
const DB = require('./../lib/db.js');
const seatOrderObj = require('../lib/utils.js');
const mailObj = require('./../lib/mail.js');
const jwtObj = require('./../lib/jwt.js');

const renderWithNotification = function(res, notifyObj) {
  res.status(200).render('error', {
    layout: 'default',
    links: [{
      href: '/css/error.css'
    }],
    scripts: [{
      src: '/js/error.js'
    }],
    ___notify: notifyObj
  });
};

const register = {
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          first_name: {
            required: true,
            type: 'string',
            minlength: 1,
            maxlength: 50
          },
          last_name: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 50
          },
          email_id: {
            required: true,
            type: 'string',
            minlength: 10,
            maxlength: 191
          },
          passwd: {
            required: true,
            type: 'string',
            minlength: 6,
            maxlength: 100
          },
          mobile_number: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 15
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      // con
      await con.getConnection();

      // check for duplicate email id
      const [rowsEmailIdDuplicationCheck] = await con.execute('SELECT email_id FROM users WHERE email_id = :email_id', {
        email_id: req.body.email_id
      });
      if (rowsEmailIdDuplicationCheck.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'DATA_ERROR',
            message: [{
              property: 'email_id',
              value: req.body.email_id,
              message: 'Duplication resource found'
            }]
          }
        });
        return;
      }

      // create user
      const uid = await snowflake.id();
      await con.execute('INSERT INTO users (uid, first_name, last_name, email_id, passwd, mobile_number, fcm_token) VALUES(:uid, :first_name, :last_name, :email_id, :passwd, :mobile_number, :fcm_token)', {
        uid,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_id: req.body.email_id,
        passwd: crypto.createHash('md5').update(req.body.passwd).digest('hex'),
        mobile_number: req.body.mobile_number,
        fcm_token: ''
      });

      const [rowsUsers] = await con.execute('SELECT created_at FROM users WHERE uid = :uid', {
        uid
      });
      const verifyId = crypto.createHash('sha512').update(rowsUsers[0].created_at).digest('hex');

      // output
      const output = {
        uid,
        verifyId
      };

      // send mail
      mailObj.send({
        to: [req.body.email_id],
        subject: `SeatOrder - Register successfully`,
        html: `
          <html lang="en">
            <head>
              <style>
                body {
                  margin: 0;
                }

                .wrapper {
                  background-color: #f5f9fc;
                  padding: 15px 0;
                }

                table {
                  width: 100%;
                  padding: 0;
                  border: 0;
                  line-height: 1.5em;
                }

                .content {
                  table-layout: auto;
                  border-radius: 6px;
                  margin: 25px auto;
                  font-family: Verdana, Geneva, sans-serif;
                  max-width: 620px;
                  background-color: #fff;
                  padding: 30px 30px 20px;
                  line-height: 1.5em;
                  border: 1px solid #e6e6e6;
                  border-bottom: 3px solid #607d8b;
                  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
                }

                a {
                  color: #277b93;
                }

                .w-25-per {
                  width: 25%;
                }

                .w-75-per {
                  width: 75%;
                }

                .w-50-px {
                  width: 50px;
                }

                .w-100-px {
                  width: 100px;
                }

                .fs-10 {
                  font-size: 10px;
                }

                .fs-14 {
                  font-size: 14px;
                }

                .fs-24 {
                  font-size: 24px;
                }

                .fw-bold {
                  font-weight: bold;
                }

                .h-25 {
                  height: 25px;
                }

                .border-top-solid {
                  border-top: 1px solid #e6e6e6;
                }

                .text-left {
                  text-align: left;
                }

                .text-center {
                  text-align: center;
                }

                .text-right {
                  text-align: right;
                }

                .text-gray {
                  color: #707070;
                }

                .pull-right {
                  float: right;
                }

                tr.header div {
                  color: #607d8b;
                  font-weight: bold;
                  font-size: x-large;
                  line-height: 1.2em;
                }

                tr.header div:first {
                  padding-top: 15px;
                }

                tr.footer div,
                tr.footer span {
                  font-size: 12px;
                  line-height: 1.2em;
                }
              </style>
            </head>
            <body>
            <div class="wrapper">
              <table class="content">
                <tbody>
                  <tr class="header">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2">
                              <div>Hello ${req.body.first_name},</div>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" class="h-25">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="section">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <span class="fs-14">
                                <div>
                                  Thank you for registering with us. Please verify your email-id using this <a href="${req.protocol + '://' + req.get('host')}/verify-email-id/${uid}?verify-id=${verifyId}">link</a>
                                </div>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="footer">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2" class="h-25 border-top-solid">&nbsp;</td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <div>Mail Us</div>
                              <span>
                                <a target="_blank" href="mailto:seatOrder@gmail.com?subject=${encodeURIComponent(`seatOrder -`)}&body=${encodeURIComponent('Hello Team,')}%0D%0A${encodeURIComponent('I would like to know more about ')}">seatOrder@gmail.com</a>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </body>
          </html>
        `
      });

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
  verify: async (req, res, next) => {
    const con = new DB();
    try {

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT first_name, email_id, created_at FROM users WHERE uid = :uid AND email_status = 0', {
        uid: req.params.uid
      });

      if (!rows.length) {
        renderWithNotification(res, {
          icon: 'notifications',
          title: 'Verify Email Id',
          message: 'Verify Email Id link is Expired or Invalid',
          type: 'primary',
          delay: 0,
          position: 'top',
          align: 'center',
          dismiss: true
        });
        return;
      } else if (crypto.createHash('sha512').update(rows[0].created_at).digest('hex') !== req.query['verify-id']) {
        renderWithNotification(res, {
          icon: 'notifications',
          title: 'Verify Email Id',
          message: 'Verify Id is Invalid',
          type: 'primary',
          delay: 0,
          position: 'top',
          align: 'center',
          dismiss: true
        });
        return;
      }

      await con.execute('UPDATE users SET email_status = 1 WHERE uid = :uid', {
        uid: req.params.uid
      });

      // send mail
      mailObj.send({
        to: [rows[0].email_id],
        subject: `seatOrder - your email is verified`,
        html: `
          <html lang="en">
            <head>
              <style>
                body {
                  margin: 0;
                }

                .wrapper {
                  background-color: #f5f9fc;
                  padding: 15px 0;
                }

                table {
                  width: 100%;
                  padding: 0;
                  border: 0;
                  line-height: 1.5em;
                }

                .content {
                  table-layout: auto;
                  border-radius: 6px;
                  margin: 25px auto;
                  font-family: Verdana, Geneva, sans-serif;
                  max-width: 620px;
                  background-color: #fff;
                  padding: 30px 30px 20px;
                  line-height: 1.5em;
                  border: 1px solid #e6e6e6;
                  border-bottom: 3px solid #607d8b;
                  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
                }

                a {
                  color: #277b93;
                }

                .w-25-per {
                  width: 25%;
                }

                .w-75-per {
                  width: 75%;
                }

                .w-50-px {
                  width: 50px;
                }

                .w-100-px {
                  width: 100px;
                }

                .fs-10 {
                  font-size: 10px;
                }

                .fs-14 {
                  font-size: 14px;
                }

                .fs-24 {
                  font-size: 24px;
                }

                .fw-bold {
                  font-weight: bold;
                }

                .h-25 {
                  height: 25px;
                }

                .border-top-solid {
                  border-top: 1px solid #e6e6e6;
                }

                .text-left {
                  text-align: left;
                }

                .text-center {
                  text-align: center;
                }

                .text-right {
                  text-align: right;
                }

                .text-gray {
                  color: #707070;
                }

                .pull-right {
                  float: right;
                }

                tr.header div {
                  color: #607d8b;
                  font-weight: bold;
                  font-size: x-large;
                  line-height: 1.2em;
                }

                tr.header div:first {
                  padding-top: 15px;
                }

                tr.footer div,
                tr.footer span {
                  font-size: 12px;
                  line-height: 1.2em;
                }
              </style>
            </head>
            <body>
            <div class="wrapper">
              <table class="content">
                <tbody>
                  <tr class="header">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2">
                              <div>Hello ${rows[0].first_name},</div>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" class="h-25">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="section">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <span class="fs-14">
                                <div>
                                  Your email is verified successfully
                                </div>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="footer">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2" class="h-25 border-top-solid">&nbsp;</td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <div>Mail Us</div>
                              <span>
                                <a target="_blank" href="mailto:seatOrder@gmail.com?subject=${encodeURIComponent(`seatOrder -`)}&body=${encodeURIComponent('Hello Team,')}%0D%0A${encodeURIComponent('I would like to know more about ')}">seatOrder@gmail.com</a>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </body>
          </html>
        `
      });

      renderWithNotification(res, {
        icon: 'notifications',
        title: 'Verify Email Id',
        message: 'Verify Email Id is successfully completed',
        type: 'primary',
        delay: 0,
        position: 'top',
        align: 'center',
        dismiss: true
      });
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

const forgot = {
  get: async (req, res, next) => {
    const con = new DB();
    try {

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT passwd FROM users WHERE uid = :uid', {
        uid: req.params.uid
      });

      if (!rows.length) {
        renderWithNotification(res, {
          icon: 'notifications',
          title: 'Reset Password',
          message: 'Reset Password link is Expired or Invalid',
          type: 'primary',
          delay: 0,
          position: 'top',
          align: 'center',
          dismiss: true
        });
        return;
      } else if (crypto.createHash('sha512').update(rows[0].passwd).digest('hex') !== req.query['verify-id']) {
        renderWithNotification(res, {
          icon: 'notifications',
          title: 'Reset Password Id',
          message: 'Reset Password Id is Invalid',
          type: 'primary',
          delay: 0,
          position: 'top',
          align: 'center',
          dismiss: true
        });
        return;
      }

      res.status(200).render('forgot', {
        layout: 'default',
        links: [{
          href: '/css/forgot.css'
        }],
        scripts: [{
          src: '/js/forgot.js'
        }],
        ___data: {
          uid: req.params.uid,
          'verify-id': req.query['verify-id']
        }
      });
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          email_id: {
            required: true,
            type: 'string',
            minlength: 10,
            maxlength: 191
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT uid, first_name, passwd FROM users WHERE email_id = :email_id', {
        email_id: req.body.email_id
      });
      if (!rows.length) {
        res.status(410).json({
          error: {
            type: 'GONE',
            message: [{
              property: 'email_id',
              value: req.body.email_id,
              message: 'The target resource is no longer available at the origin server'
            }]
          }
        });
        return;
      }

      const verifyId = crypto.createHash('sha512').update(rows[0].passwd).digest('hex');

      // send mail
      mailObj.send({
        to: [req.body.email_id],
        subject: `seatOrder - password reset`,
        html: `
          <html lang="en">
            <head>
              <style>
                body {
                  margin: 0;
                }

                .wrapper {
                  background-color: #f5f9fc;
                  padding: 15px 0;
                }

                table {
                  width: 100%;
                  padding: 0;
                  border: 0;
                  line-height: 1.5em;
                }

                .content {
                  table-layout: auto;
                  border-radius: 6px;
                  margin: 25px auto;
                  font-family: Verdana, Geneva, sans-serif;
                  max-width: 620px;
                  background-color: #fff;
                  padding: 30px 30px 20px;
                  line-height: 1.5em;
                  border: 1px solid #e6e6e6;
                  border-bottom: 3px solid #607d8b;
                  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
                }

                a {
                  color: #277b93;
                }

                .w-25-per {
                  width: 25%;
                }

                .w-75-per {
                  width: 75%;
                }

                .w-50-px {
                  width: 50px;
                }

                .w-100-px {
                  width: 100px;
                }

                .fs-10 {
                  font-size: 10px;
                }

                .fs-14 {
                  font-size: 14px;
                }

                .fs-24 {
                  font-size: 24px;
                }

                .fw-bold {
                  font-weight: bold;
                }

                .h-25 {
                  height: 25px;
                }

                .border-top-solid {
                  border-top: 1px solid #e6e6e6;
                }

                .text-left {
                  text-align: left;
                }

                .text-center {
                  text-align: center;
                }

                .text-right {
                  text-align: right;
                }

                .text-gray {
                  color: #707070;
                }

                .pull-right {
                  float: right;
                }

                tr.header div {
                  color: #607d8b;
                  font-weight: bold;
                  font-size: x-large;
                  line-height: 1.2em;
                }

                tr.header div:first {
                  padding-top: 15px;
                }

                tr.footer div,
                tr.footer span {
                  font-size: 12px;
                  line-height: 1.2em;
                }
              </style>
            </head>
            <body>
            <div class="wrapper">
              <table class="content">
                <tbody>
                  <tr class="header">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2">
                              <div>Hello ${rows[0].first_name},</div>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" class="h-25">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="section">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <span class="fs-14">
                                <div>
                                  Using the following link to reset your password <a href="${req.protocol + '://' + req.get('host')}/forgot/${rows[0].uid}?verify-id=${verifyId}">link</a>
                                </div>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="footer">
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="2" class="h-25 border-top-solid">&nbsp;</td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <div>Mail Us</div>
                              <span>
                                <a target="_blank" href="mailto:seatOrder@gmail.com?subject=${encodeURIComponent(`seatOrder -`)}&body=${encodeURIComponent('Hello Team,')}%0D%0A${encodeURIComponent('I would like to know more about ')}">seatOrder@gmail.com</a>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </body>
          </html>
        `
      });

      // output
      const output = {};

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
  put: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          uid: {
            required: true,
            type: 'string',
            pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[ab89][0-9a-f]{3}-[0-9a-f]{12}$/
          },
          'verify-id': {
            required: true,
            type: 'string',
            minlength: 128,
            maxlength: 128
          },
          password: {
            required: true,
            type: 'string'
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT passwd FROM users WHERE uid = :uid', {
        uid: req.body.uid
      });
      if (!rows.length) {
        res.status(410).json({
          error: {
            type: 'GONE',
            message: [{
              property: 'email_id',
              value: req.body.email_id,
              message: 'The target resource is no longer available at the origin server'
            }]
          }
        });
        return;
      }

      if (crypto.createHash('sha512').update(rows[0].passwd).digest('hex') !== req.body['verify-id']) {
        res.status(400).json({
          error: {
            icon: 'notifications',
            title: 'Verify Id',
            message: 'Verify Id is Invalid',
            type: 'primary',
            delay: 0,
            position: 'top',
            align: 'center',
            dismiss: true
          }
        });
      }

      await con.execute('UPDATE users SET passwd = :passwd WHERE uid = :uid', {
        uid: req.body.uid,
        passwd: crypto.createHash('md5').update(Buffer.from(req.body.password, 'base64').toString()).digest('hex')
      });

      // output
      const output = {
        isSuccess: true
      };

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

const login = {
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          email_id: {
            required: true,
            type: 'string',
            minlength: 10,
            maxlength: 191
          },
          passwd: {
            required: true,
            type: 'string',
            minlength: 6,
            maxlength: 100
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      req.body.passwd = crypto.createHash('md5').update(req.body.passwd).digest('hex');

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT uid, email_status FROM users WHERE email_id = :email_id AND passwd = :passwd', {
        email_id: req.body.email_id,
        passwd: req.body.passwd
      });
      if (!rows.length) {
        res.status(400).json({
          error: {
            type: 'BAD_REQUEST',
            message: 'Invalid user name or password'
          }
        });
        return;
      }
      if (rows.length && rows[0].email_status === 0) {
        res.status(400).json({
          error: {
            type: 'BAD_REQUEST',
            message: 'your email id is not verified, Please verify and relogin'
          }
        });
        return;
      }

      // create access token
      const jwtid = `${rows[0].uid}`;

      // output
      const output = {};

      output.access_token = jwtObj.sign({}, jwtid, 'accessToken');
      output.expires_in = jwtConfig.expiresIn.accessToken;

      // create refresh_token
      output.refresh_token = jwtObj.sign({}, jwtid, 'refreshToken');

      await con.execute(`INSERT INTO tokens (jwtid, access_token_hash, refresh_token_hash)
        VALUES (:jwtid, :access_token_hash, :refresh_token_hash)
        ON DUPLICATE KEY UPDATE access_token_hash = :access_token_hash, refresh_token_hash = :refresh_token_hash;`, {
        jwtid,
        access_token_hash: crypto.createHash('md5').update(output.access_token).digest('hex'),
        refresh_token_hash: crypto.createHash('md5').update(output.refresh_token).digest('hex')
      });

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

const token = {
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          access_token: {
            required: true,
            type: 'string'
          },
          refresh_token: {
            required: true,
            type: 'string'
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      const accessToken = req.body.access_token.replace('Bearer ', '');
      const jwtDataAccessToken = jwtObj.verify(accessToken);
      if (jwtDataAccessToken.isValid) {
        const refreshToken = req.body.refresh_token.replace('Bearer ', '');
        const jwtDataRefreshToken = jwtObj.verify(refreshToken);
        if (jwtDataRefreshToken.isValid) {
          if (!jwtDataRefreshToken.isExpired) {

            // con
            await con.getConnection();

            // check row exist or not
            const [rows] = await con.execute('SELECT jwtid FROM tokens WHERE access_token_hash = :access_token_hash AND refresh_token_hash = :refresh_token_hash', {
              access_token_hash: crypto.createHash('md5').update(accessToken).digest('hex'),
              refresh_token_hash: crypto.createHash('md5').update(refreshToken).digest('hex')
            });

            if (rows.length) {

              // output
              const output = {};

              // create access token
              delete jwtDataAccessToken.payload.exp;
              delete jwtDataAccessToken.payload.jti;
              output.access_token = jwtObj.sign(jwtDataAccessToken.payload, rows[0].jwtid, 'accessToken');
              output.expires_in = jwtConfig.expiresIn.accessToken;

              // create refresh_token
              delete jwtDataRefreshToken.payload.exp;
              delete jwtDataRefreshToken.payload.jti;
              output.refresh_token = jwtObj.sign(jwtDataRefreshToken.payload, rows[0].jwtid, 'refreshToken');

              // update in our database
              await con.execute(`INSERT INTO tokens (jwtid, access_token_hash, refresh_token_hash)
                VALUES (:jwtid, :access_token_hash, :refresh_token_hash)
                ON DUPLICATE KEY UPDATE access_token_hash = :access_token_hash, refresh_token_hash = :refresh_token_hash`, {
                jwtid: rows[0].jwtid,
                access_token_hash: crypto.createHash('md5').update(output.access_token).digest('hex'),
                refresh_token_hash: crypto.createHash('md5').update(output.refresh_token).digest('hex')
              });

              res.status(200).json(output);
            } else {
              res.status(400).json({
                error: {
                  type: 'BAD_REQUEST',
                  sub_type: 'TOKEN_NOTEXIST',
                  message: 'access token and refresh token are valid but not exist in our records'
                }
              });
            }
          } else {
            res.status(400).json({
              error: {
                type: 'BAD_REQUEST',
                sub_type: 'EXPIRED_REFRESH_TOKEN',
                message: 'Expired refresh token'
              }
            });
          }
        } else {
          res.status(400).json({
            error: {
              type: 'BAD_REQUEST',
              sub_type: 'INVALID_REFRESH_TOKEN',
              message: 'Invalid refresh token'
            }
          });
        }
      } else {
        res.status(400).json({
          error: {
            type: 'BAD_REQUEST',
            sub_type: 'INVALID_ACCESS_TOKEN',
            message: 'Invalid access token'
          }
        });
      }
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

const profile = {
  get: async (_req, res, next) => {
    const con = new DB();
    try {

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT first_name, last_name, email_id, language, mobile_number, zip_code, country_code, updated_at FROM users WHERE uid = :uid', {
        uid: res.locals.payload.jti
      });

      // output
      const output = {
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email_id: rows[0].email_id,
        language: rows[0].language,
        mobile_number: rows[0].mobile_number,
        zip_code: rows[0].zip_code,
        country_code: rows[0].country_code,
        last_updated_at: rows[0].updated_at
      };

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          first_name: {
            required: true,
            type: 'string',
            minlength: 1,
            maxlength: 50
          },
          last_name: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 50
          },
          email_id: {
            required: true,
            type: 'string',
            minlength: 10,
            maxlength: 191
          },
          language: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 10
          },
          mobile_number: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 15
          },
          zip_code: {
            required: true,
            type: 'string',
            minlength: 0,
            maxlength: 10
          },
          country_code: {
            required: true,
            type: 'string',
            values: countriesYamlConfig.countries.map(each => each.alpha3Code)
          },
          fcm_token: {
            required: true,
            type: 'string'
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      // con
      await con.getConnection();

      const [rows] = await con.execute('SELECT 1 FROM users WHERE email_id = :email_id AND uid != :uid', {
        email_id: req.body.email_id,
        uid: res.locals.payload.jti
      });
      if (rows.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'DATA_ERROR',
            message: [{
              property: 'email_id',
              value: req.body.email_id,
              message: 'Duplication resource found'
            }]
          }
        });
        return;
      }

      // update user
      await con.execute(`UPDATE users SET first_name = :first_name, last_name = :last_name, email_id = :email_id, language = :language, mobile_number = :mobile_number,
        zip_code = :zip_code, country_code = :country_code, fcm_token = :fcm_token WHERE uid = :uid`, {
        uid: res.locals.payload.jti,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_id: req.body.email_id,
        language: req.body.language,
        mobile_number: req.body.mobile_number,
        zip_code: req.body.zip_code,
        country_code: req.body.country_code,
        fcm_token: req.body.fcm_token
      });

      // output
      const output = {};

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

const profilePasswd = {
  post: async (req, res, next) => {
    const con = new DB();
    try {

      // validation
      const schema = {
        properties: {
          passwd: {
            required: true,
            type: 'string',
            minlength: 6,
            maxlength: 100
          }
        }
      };
      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: 'UNPROCESSABLE_ENTITY',
            sub_type: 'SCHEMA_ERROR',
            message: err
          }
        });
        return;
      }

      // con
      await con.getConnection();

      // update user
      await con.execute(`UPDATE users SET passwd = :passwd WHERE uid = :uid`, {
        uid: res.locals.payload.jti,
        passwd: crypto.createHash('md5').update(req.body.passwd).digest('hex')
      });

      // output
      const output = {};

      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  }
};

module.exports = {
  register,
  forgot,
  login,
  token,
  profile,
  profilePasswd
};
