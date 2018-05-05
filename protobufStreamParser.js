const fs = require('fs');
const path = require('path');

const through2 = require('through2')
const Protobuf = require("node-protobuf")
const varint = require('varint');

const baseMessageTypes = require('./baseMessageTypes')
const keynoteMessageTypes = require('./keynoteMessageTypes')

module.exports = () => {
  const pb = new Protobuf(fs.readFileSync(path.join(__dirname, 'types.desc')))
  return through2.obj(function (chunk, enc, cb) {
    let cursor = 0;
    while(cursor < chunk.length) {
      const archiveInfoLength = varint.decode(chunk.slice(cursor));
      cursor += varint.decode.bytes; //consumed x for length
  
      // Get Archive Info
      const archiveInfoBlob = chunk.slice(cursor, archiveInfoLength + cursor)
      cursor += archiveInfoLength; // consumed archiveInfo
      const archiveInfo = pb.parse(archiveInfoBlob, "ArchiveInfo");
  
      let messages = []
      archiveInfo.message_infos.forEach(messageInfo => {
        const payloadBlob = chunk.slice(cursor, messageInfo.length + cursor)
        cursor += messageInfo.length; // consumed payload
  
        const type = keynoteMessageTypes[messageInfo.type] || baseMessageTypes[messageInfo.type];

        if(payloadBlob.length < messageInfo.length) {
          cb(new Error('IWA file truncated before reading last protobuf MessageInfo payload'))
        } else {
          messages.push({
            messageInfo,
            type,
            payload: type && pb.parse(payloadBlob, type)
          })
        }
      })
  
      this.push({
        archiveInfo,
        messages
      });
    }
    cb()
  })
}