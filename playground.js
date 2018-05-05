const fs = require('fs')
const path = require('path')

const keynote = require('./')

const keynoteFilePath = path.resolve(__dirname, 'test', 'fixtures', 'test.key')

async function main() {
  const inputKeyfileStream = fs.createReadStream(keynoteFilePath);

  const data = await keynote(inputKeyfileStream);

  console.log(data)
}

main()