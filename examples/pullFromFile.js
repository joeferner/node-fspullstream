var FSPullStream = require('../');
var fs = require('fs');
var path = require('path');

var ps = new PullStream();
var loremIpsumStream = new FSPullStream(path.join(__dirname, 'loremIpsum.txt'));
var outputStream = fs.createWriteStream(path.join(__dirname, 'loremIpsum.out'));

loremIpsumStream.pull(5, function (err, data) {
  console.log(data.toString('utf8'));

  loremIpsumStream.pipe(100, outputStream).on('end', function () {
    console.log('all done');
  });
});

