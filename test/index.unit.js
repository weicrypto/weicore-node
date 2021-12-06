'use strict';

var should = require('chai').should();

describe('Index Exports', function() {
  it('will export weicore-lib', function() {
    var weicore = require('../');
    should.exist(weicore.lib);
    should.exist(weicore.lib.Transaction);
    should.exist(weicore.lib.Block);
  });
});
