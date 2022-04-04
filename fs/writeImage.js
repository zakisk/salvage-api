const mkdir = require('./mkdir')
const fs = require('fs')

const writeImage = (path, imageData, type, callback) => {
	mkdir.mkdirPath(path, (res, msg) => {
	   if (res) {
	     var image = Buffer.from(imageData, 'base64')
	     fs.writeFile(`${path}${Date.now()}.${type}`, image, 'base64', err => {
                    if (err) {
			callback(false, err)
		    } else {
			callback(true, "successfully wrote image")
		    }
             })
	   } else {
	    callback(res, msg)
	   }
	})

}

module.exports = writeImage
