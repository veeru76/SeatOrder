'use strict';

const config = {};
config.host = process.env.MAIL_HOST || 'smtpout.secureserver.net';
config.user = process.env.MAIL_USER || 'veeranjaneyaveeru@gmail.com';
config.password = process.env.MAIL_PASS || 'veeranji@007';
config.refreshToken = process.env.REFRESH_TOKEN || "1//04dwLlZeq0BszCgYIARAAGAQSNwF-L9IrTWtZ3xprBGVZFAZmQmSL5WNUT7vCCq56ChYleD9TyJU2DDWmEJ0l4PhxVbs9Ha2M0_s";
config.clientSecret = process.env.CLIENT_SECRET || "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";
config.clientId = process.env.CLIENT_ID || "631882517898-rqc3kd9thmq6f8hal8qpthbgu70cgaq4.apps.googleusercontent.com";
config.redirectUri = process.env.REDIRECT_URI || 'https://developers.google.com/oauthplayground';

module.exports = config;
