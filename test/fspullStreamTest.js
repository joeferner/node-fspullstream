'use strict';

var nodeunit = require('nodeunit');
var fs = require("fs");
var path = require("path");
var streamBuffers = require("stream-buffers");
var FSPullStream = require('../');

module.exports = {
  "read from file": function (t) {
    var ps = new FSPullStream(path.join(__dirname, 'testFile.txt'));
    ps.on('end', function () {
      return t.done();
    });

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      var buf = new streamBuffers.WritableStreamBuffer();
      ps.pipe(' World!'.length, buf).on('close', function (err) {
        if (err) {
          return t.done(err);
        }
        t.equal(' World!', buf.getContentsAsString());
        t.done();
      });
    });
  },

  "read from file pipe pause/resume": function (t) {
    var ps = new FSPullStream(path.join(__dirname, 'testFile.txt'));

    ps.pause();
    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      ps.pull(' World!'.length, function (err, data) {
        if (err) {
          return t.done(err);
        }
        t.equal(' World!', data.toString());

        ps.pull(5, function (err, data) {
          t.ok(err, 'end of file should happen');
          return t.done();
        });
      });
    });

    process.nextTick(function () {
      ps.resume();
    });
  }
};

