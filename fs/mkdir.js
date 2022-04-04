const fs = require('fs')
const path = require('path')

const mkdirPath = (dirPath, callback) => {

    if(!fs.existsSync(dirPath)) {
	fs.mkdir(dirPath, err => {
	    if (err) {
               callback(false, err)
	    } else {
	       callback(true, "created path successfully")
	    }
	})
    } else {
	callback(true, "path is already exists")
    }
}


module.exports = mkdirPath
