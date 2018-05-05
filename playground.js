const fs = require('fs');
const fsp = require('fs/promises')
const os = require('os');
const path = require('path');

const fstream = require('fstream')
const unzip = require('unzip');

const snappier = require('./snappier')
const protobufStreamParser = require('./protobufStreamParser')

const keynoteFilePath = path.resolve(__dirname, '..', 'test.key')

const keynoteArchivesMap = {}

function logIWAFile(iwaFileStream) {
  return new Promise(resolve => {
    const out = iwaFileStream.pipe(snappier()).pipe(protobufStreamParser())
    out.on('error', err => {
      console.log("Error in", iwaFileStream.path);
      resolve(err)
    })
    out.on('data', obj => {
      keynoteArchivesMap[obj.archiveInfo.identifier] = obj
    })
    out.on('end', () => {
      resolve(null);
    })
  })
}

async function main() {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'keynoteParser-'));

  const inputKeyfileStream = fs.createReadStream(keynoteFilePath);
  const outputDirectoryWriter = fstream.Writer(tmpDir);

  inputKeyfileStream.pipe(unzip.Parse()).pipe(outputDirectoryWriter)

  outputDirectoryWriter.on('close', async () => {
    const indexFiles = await fsp.readdir(path.join(tmpDir, 'Index'))
    const iwaFiles = indexFiles.filter(a => a.endsWith('.iwa')).map(fName => path.join(tmpDir, 'Index', fName))

    const errors = await Promise.all(iwaFiles.map(fPath => fs.createReadStream(fPath)).map(logIWAFile))

    console.log('Percentage without errors:', errors.filter(x => x=== null).length / errors.length)
    console.log(keynoteArchivesMap[1].messages[0])
  })

}

main()