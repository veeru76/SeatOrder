'use strict';

const welcomeController = async (_req, res, next) => {
  try {
    res.status(200).json({
      message: 'Welcome to Seat Order.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = welcomeController;
