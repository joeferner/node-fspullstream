fspullstream
============

Same API as [pullstream](https://github.com/nearinfinity/node-pullstream.git) but optimized for file reading.

## Quick Examples

```javascript
var FSPullStream = require('fspullstream');

var ps = new FSPullStream('loremIpsum.txt');
var outputStream = fs.createWriteStream(path.join(__dirname, 'loremIpsum.out'));

// pull 5 bytes
ps.pull(5, function(err, data) {
  console.log(data.toString('utf8'));

  // pipe the next 100 to a file
  ps.pipe(100, outputStream).on('end', function () {
    console.log('all done');
  });
});
```

API
===

See [pullstream](https://github.com/nearinfinity/node-pullstream.git).
