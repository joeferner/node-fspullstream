'use strict';

module.exports = FSPullStream;

var over = require('over');
var fs = require('fs');
var util = require("util");
var events = require("events");

function FSPullStream(fileName, opts) {
  events.EventEmitter.call(this);
  var self = this;
  this.opts = opts || {};
  this.opts.pipeReadSize = this.opts.pipeReadSize || (10 * 1024);
  this._pos = 0;
  this._nextCmd = null;
  process.nextTick(function () {
    fs.open(fileName, 'r', function (err, fd) {
      if (err) {
        self.emit('error', err);
      }
      self._fd = fd;
      self._processNextCmd();
    });
  });
}
util.inherits(FSPullStream, events.EventEmitter);

FSPullStream.prototype.pull = over([
  [over.numberOptionalWithDefault(null), over.func, function (len, callback) {
    if (len === 0) {
      return process.nextTick(function () {
        callback(null, new Buffer(0));
      });
    }

    if (!this._fd) {
      if (this._nextCmd !== null) {
        throw new Error("Command already queued to run.");
      }
      this._nextCmd = this._pull.bind(this, len, callback);
    } else {
      this._pull(len, callback);
    }
  }]
]);

FSPullStream.prototype._pull = function (len, callback) {
  var self = this;
  self._nextCmd = null;

  if (len === null) {
    throw new Error("Not Implemented");
  }
  if (!this._fd) {
    return callback(new Error("Bad file descriptor"));
  }

  var buffer = new Buffer(len);
  fs.read(self._fd, buffer, 0, buffer.length, self._pos, function (err, bytesRead, buffer) {
    if (err) {
      return callback(err);
    }
    self._pos += bytesRead;
    if (bytesRead != buffer.length) {
      return callback(new Error("Could not read enough data. Expected " + buffer.length + " got " + bytesRead));
    }
    return callback(null, buffer);
  });
};

FSPullStream.prototype.pipe = over([
  [over.numberOptionalWithDefault(null), over.object, function (len, destStream) {
    if (len === 0) {
      return process.nextTick(function () {
        callback(null, new Buffer(0));
      });
    }

    if (!this._fd) {
      if (this._nextCmd !== null) {
        throw new Error("Command already queued to run.");
      }
      this._nextCmd = this._pipe.bind(this, len, destStream);
    } else {
      this._pipe(len, destStream);
    }

    return destStream;
  }]
]);

FSPullStream.prototype._pipe = function (len, destStream) {
  var self = this;
  self._nextCmd = null;

  if (len === null) {
    throw new Error("Not Implemented");
  }
  if (!this._fd) {
    return callback(new Error("Bad file descriptor"));
  }

  var buffer = new Buffer(Math.min(len, self.opts.pipeReadSize));
  fs.read(self._fd, buffer, 0, buffer.length, self._pos, function (err, bytesRead, buffer) {
    if (err) {
      return callback(err);
    }
    self._pos += bytesRead;
    len -= bytesRead;
    buffer = buffer.slice(0, bytesRead);
    destStream.write(buffer);
    if (len === 0) {
      destStream.end();
    } else {
      self._pipe(len, destStream);
    }
  });
};

FSPullStream.prototype._processNextCmd = function () {
  if (this._nextCmd) {
    this._nextCmd();
  }
};

FSPullStream.prototype.pause = function () {
  this.paused = true;
};

FSPullStream.prototype.resume = function () {
  var self = this;
  this.paused = false;
  process.nextTick(function () {
    if (self._fd) {
      self._processNextCmd();
    } else {
      self.resume();
    }
  });
};
