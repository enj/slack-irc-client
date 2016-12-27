'use strict';

var winston = require('winston');

module.exports = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      name: 'chats',
      filename: 'chats.log',
      level: 'info'
    })
  ]
});
