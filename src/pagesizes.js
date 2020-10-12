const fs = require('fs')
const path = require('path');

const getPageSizes = (request, response) => {
    response.send(JSON.parse(fs.readFileSync('page_sizes.json'), 'utf-8'))
}

module.exports = {
    getPageSizes: getPageSizes
}
