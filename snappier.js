const snappy = require('snappy')
const snappyStream = require('snappy-stream')
const through2 = require('through2')
const pipe = require('multipipe')

const varint = require('varint');

// return a stream that uncompresses an IWA format "snappy" stream
module.exports = () => {
  const uncompressStream = snappyStream.createUncompressStream();

  // write the snappy stream identifier
  uncompressStream.write(Buffer.from([0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x59]));

  // adapter that converts apple IWA format (non-standard snappy) to compatible snappy stream
  const adapter = through2(function (chunk, enc, cb) {
    // we're adding the checksum, so adjust length to account for that
    const length = chunk.readUIntLE(1, 3);
    const prefix = Buffer.allocUnsafe(4);
    prefix[0] = chunk[0];
    prefix.writeUIntLE(length+4, 1, 3)
    
    // construct the replacement "snappy compatible" chunk
    const newChunk = Buffer.concat([prefix, Buffer.from([0xa2, 0x82, 0xea, 0xd8]), chunk.slice(4)])
    
    this.push(newChunk);
    cb()
  })

  return pipe(adapter, uncompressStream);
}