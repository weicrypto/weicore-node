'use strict';

// To run the tests: $ mocha -R spec regtest/p2p.js

var path = require('path');
var index = require('..');
var log = index.log;

var p2p = require('@weicrypto/weicore-p2p');
var Peer = p2p.Peer;
var Messages = p2p.Messages;
var chai = require('chai');
var weicore = require('@weicrypto/weicore-lib');
var Transaction = weicore.Transaction;
var BN = weicore.crypto.BN;
var async = require('async');
var rimraf = require('rimraf');
var weid;

/* jshint unused: false */
var should = chai.should();
var assert = chai.assert;
var sinon = require('sinon');
var WeidRPC = require('@weicrypto/weid-rpc');
var transactionData = [];
var blockHashes = [];
var txs = [];
var client;
var messages;
var peer;
var coinbasePrivateKey;
var privateKey = weicore.PrivateKey();
var destKey = weicore.PrivateKey();
var BufferUtil = weicore.util.buffer;
var blocks;

describe('P2P Functionality', function() {

  before(function(done) {
    this.timeout(200000);

    // enable regtest
    weicore.Networks.enableRegtest();
    var regtestNetwork = weicore.Networks.get('regtest');
    var datadir = __dirname + '/data';

    rimraf(datadir + '/regtest', function(err) {
      if (err) {
        throw err;
      }

      weid = require('../').services.Wei({
        spawn: {
          datadir: datadir,
          exec: path.resolve(__dirname, process.env.HOME, './.weicore/data/weid')
        },
        node: {
          network: weicore.Networks.testnet
        }
      });

      weid.on('error', function(err) {
        log.error('error="%s"', err.message);
      });

      log.info('Waiting for Wei Core to initialize...');

      weid.start(function(err) {
        if (err) {
          throw err;
        }
        log.info('Weid started');

        client = new WeidRPC({
          protocol: 'http',
          host: '127.0.0.1',
          port: 30331,
          user: 'wei',
          pass: 'local321',
          rejectUnauthorized: false
        });

        peer = new Peer({
          host: '127.0.0.1',
          port: '19994',
          network: regtestNetwork
        });

        messages = new Messages({
          network: regtestNetwork
        });

        blocks = 500;

        log.info('Generating ' + blocks + ' blocks...');

        // Generate enough blocks so that the initial coinbase transactions
        // can be spent.

        setImmediate(function() {
          client.generate(blocks, function(err, response) {
            if (err) {
              throw err;
            }
            blockHashes = response.result;

            log.info('Preparing test data...');

            // Get all of the unspent outputs
            client.listUnspent(0, blocks, function(err, response) {
              var utxos = response.result;

              async.mapSeries(utxos, function(utxo, next) {
                async.series([
                  function(finished) {
                    // Load all of the transactions for later testing
                    client.getTransaction(utxo.txid, function(err, txresponse) {
                      if (err) {
                        throw err;
                      }
                      // add to the list of transactions for testing later
                      transactionData.push(txresponse.result.hex);
                      finished();
                    });
                  },
                  function(finished) {
                    // Get the private key for each utxo
                    client.dumpPrivKey(utxo.address, function(err, privresponse) {
                      if (err) {
                        throw err;
                      }
                      utxo.privateKeyWIF = privresponse.result;
                      var tx = weicore.Transaction();
                      tx.from(utxo);
                      tx.change(privateKey.toAddress());
                      tx.to(destKey.toAddress(), utxo.amount * 1e8 - 1000);
                      tx.sign(weicore.PrivateKey.fromWIF(utxo.privateKeyWIF));
                      txs.push(tx);
                      finished();
                    });
                  }
                ], next);
              }, function(err) {
                if (err) {
                  throw err;
                }
                peer.on('ready', function() {
                  log.info('Peer ready');
                  done();
                });
                log.info('Connecting to peer');
                peer.connect();
              });
            });
          });
        });
      });
    });

  });

  after(function(done) {
    this.timeout(20000);
    peer.on('disconnect', function() {
      log.info('Peer disconnected');
      weid.node.stopping = true;
      weid.stop(function(err, result) {
        done();
      });
    });
    peer.disconnect();
  });

  it('will be able to handle many inventory messages and be able to send getdata messages and received the txs', function(done) {
    this.timeout(100000);

    var usedTxs = {};

    weid.on('tx', function(buffer) {
      var txFromResult = new Transaction().fromBuffer(buffer);
      var tx = usedTxs[txFromResult.id];
      should.exist(tx);
      buffer.toString('hex').should.equal(tx.serialize());
      delete usedTxs[tx.id];
      if (Object.keys(usedTxs).length === 0) {
        done();
      }
    });

    peer.on('getdata', function(message) {
      var hash = message.inventory[0].hash;
      var reversedHash = BufferUtil.reverse(hash).toString('hex');
      var tx = usedTxs[reversedHash];
      if (reversedHash === tx.id) {
        var txMessage = messages.Transaction(tx);
        peer.sendMessage(txMessage);
      }
    });
    async.whilst(
      function() {
        return txs.length > 0;
      },
      function(callback) {
        var tx = txs.pop();
        usedTxs[tx.id] = tx;
        var message = messages.Inventory.forTransaction(tx.hash);
        peer.sendMessage(message);
        callback();
      },
      function(err) {
        if (err) {
          throw err;
        }
      });
  });

});
