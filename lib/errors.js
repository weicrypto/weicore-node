'use strict';

var createError = require('errno').create;

var WeicoreNodeError = createError('WeicoreNodeError');

var RPCError = createError('RPCError', WeicoreNodeError);

module.exports = {
  Error: WeicoreNodeError,
  RPCError: RPCError
};
