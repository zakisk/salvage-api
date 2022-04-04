


// import dependencies and initialize express
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const db = require('../query/executeQuery')
const admin = require('../notification/admin').admin
const fs = require('fs')
const imageUtil = require('../fs/writeImage')
const mysql = require('mysql')
const notification = require('../notification/notify')
const adminId = require('../query/cred.js').adminId
const vehicle = 'vehicle'
const sparePart = 'spare_part'


const app = express()
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.static('public'))




app.all('/notify/:postId', (req, res) => {
	var type = req.body.type
	var sql = "SELECT userId FROM Users WHERE userId = ?"
	var query = mysql.format(sql, [req.header('userId')])
	db.executeQuery(query, (result) => {
	    if (result.length > 0) {
		if (type == vehicle) {
		   sql = "SELECT postId, title, brandName FROM Vehicles WHERE postId = ?"
		} else {
		   sql = "SELECT postId, title, brandName FROM SpareParts WHERE postId = ?"
                }
		query = mysql.format(sql, [req.params.postId])
		db.executeQuery(query, (qResult) => {
		   if(qResult.length > 0) {
			var obj = qResult[0]
			notification.notify(obj.postId, obj.title, obj.brandName, type, (response) => {
				res.send(response)
			})
		   } else { res.send('vehicle not found') }
		})
	    } else { res.send('credential not found') }
	})
})




app.all('/get-users', (req, res) => {
	if (req.header('userId') == adminId) {
	   var sql = "SELECT * FROM Users"
	   db.executeQuery(sql, (result) => {
		res.send(result)
          })
	} else {
	   res.status(404).send('access denied')
	}
})



app.all('/get-vehicles/:sellType', (req, res) => {
	var sql = "SELECT userId FROM Users WHERE userId = ?"
	var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
		if (result.length > 0) {
		    if (req.header('userId') == adminId) {
                       query = "SELECT * FROM Vehicles"
		    } else {
		       sql = "SELECT * FROM Vehicles WHERE sellType = ?"
		       query = mysql.format(sql, [req.params.sellType])
		    }
                    db.executeQuery(query, (result) => {
     			res.status(200).send(result)
                    })
		} else {
		    res.send("credentials are not exist")
		}
	})
})



app.all('/get-vehicles-by-id/', (req, res) => {
        var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "SELECT * FROM Vehicles WHERE userId = ?"
                    query = mysql.format(sql, [req.header('userId')])
                    db.executeQuery(query, (result) => {
                        res.status(200).send(result)
                    })
                } else {
                    res.send("credentials are not exist")
                }
        })
})



app.all('/get-vehicles-by-approval/:approval', (req, res) => {
	if (req.header('userId') == adminId) {
        	var sql = "SELECT * FROM Vehicles WHERE isApproved = ? AND userId != ?"
	        var query = mysql.format(sql, [req.params.approval, adminId])
		db.executeQuery(query, (result) => {
		    res.send(result)
		})
	} else { res.send('access denied') }
})



app.all('/get-vehicle/:postId', (req, res) => {
        var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "SELECT * FROM Vehicles WHERE postId = ?"
                    query = mysql.format(sql, [req.params.postId])
                    db.executeQuery(query, (result) => {
			try { res.status(200).send(result[0]) }
			catch(e) { res.status(404).send(null) }
                    })
                } else {
                    res.send("credentials are not exist")
                }
        })
})



app.all('/get-spare-parts', (req, res) => {
        var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    query = "SELECT * FROM SpareParts"
                    db.executeQuery(query, (result) => {
                        res.status(200).send(result)
                    })
                } else {
                    res.send("credentials are not exist")
                }
        })
})




app.all('/get-spare-parts-by-id', (req, res) => {
        var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "SELECT * FROM SpareParts WHERE userId = ?"
		    query = mysql.format(sql, [req.header('userId')])
                    db.executeQuery(query, (result) => {
                        res.status(200).send(result)
                    })
                } else {
                    res.send("credentials are not exist")
                }
        })
})





app.all('/get-spare-parts-by-approval/:approval', (req, res) => {
        if (req.header('userId') == adminId) {
                var sql = "SELECT * FROM SpareParts WHERE isApproved = ? AND userId != ?"
                var query = mysql.format(sql, [req.params.approval, adminId])
                db.executeQuery(query, (result) => {
                    res.send(result)
                })
        } else { res.send('access denied') }
})





app.all('/get-spare-part/:postId', (req, res) => {
        var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [req.header('userId')])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "SELECT * FROM SpareParts WHERE postId = ?"
                    query = mysql.format(sql, [req.params.postId])
                    db.executeQuery(query, (result) => {
                        try { res.status(200).send(result[0]) }
                        catch(e) { res.status(404).send(null) }
                    })
                } else {
                    res.send("credentials are not exist")
                }
        })
})




app.all('/create-user', (req, res) => {
	var body = req.body

	var sql = "SELECT userId FROM Users WHERE userId = ?"
        var query = mysql.format(sql, [body.userId])
	var tSql = null

        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "UPDATE Users SET name = ?, city = ?, state = ?, mobileNo = ?, timeStamp = ? WHERE userId = ?"
                    query = mysql.format(sql, [body.name, body.city, body.state, body.mobileNo, body.timeStamp, body.userId])
		    var tSql = "UPDATE NotificationTokens SET name = ? WHERE userId = ?"
                } else {
                    sql = "INSERT INTO Users VALUES (?,?,?,?,?,?,?)"
        	    query = mysql.format(sql, [body.userId, body.name, body.city, body.state, body.mobileNo, body.timeStamp, body.isBlocked])
                }

                db.executeQuery(query, (response) => {
		    if (tSql != null) {
			var tQuery = mysql.format(tSql, [body.name, body,userId])
			db.executeQuery(tQuery, (tRes) => {})
		    }
                    res.status(200).send(response)
                })
        })
})


app.all('/insert-notification-token', (req, res) => {
	var userId = req.body.userId
	var name = req.body.name
	var deviceId = req.body.deviceId
	var tokenId = req.body.tokenId

	var sql = "SELECT userId FROM NotificationTokens WHERE userId = ?"
        var query = mysql.format(sql, [userId])
        db.executeQuery(query, (result) => {
                if (result.length > 0) {
                    sql = "UPDATE NotificationTokens SET name = ?, deviceId = ?, tokenId = ? WHERE userId = ?"
		    query = mysql.format(sql, [name, deviceId, tokenId, userId])
                } else {
                    sql = "INSERT INTO NotificationTokens(userId, name, deviceId, tokenId) VALUES (?,?,?,?)"
		    query = mysql.format(sql, [userId, name, deviceId, tokenId])
                }
		db.executeQuery(query, (result) => {
           	    res.status(200).send(result)
        	})
        })
})



app.all('/update-notification-token', (req, res) => {

        var sql = "UPDATE NotificationTokens SET tokenId = ? WHERE userId = ?"
        var query = mysql.format(sql, [req.body.tokenId, req.header('userId')])
        db.executeQuery(query, (result) => {
           res.status(200).send(result)
        })
})



app.all('/insert-vehicle', (req, res) => {
	var body = req.body
	var isApproved = 0
	if (body.userId == adminId) {
	    isApproved = 1
	}
	var sql = "INSERT INTO Vehicles\n VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

        var query = mysql.format(sql, [
			body.userId, body.postId, body.postDate, body.vehicleType, body.brandName, body.year, body.title, body.otherDetails,
			body.vehicleNo, body.transmissionType, body.fuelType, body.kmDriven, body.documentStatus, body.sellType, isApproved,
			body.ownerNumber, body.vehicleCity, body.vehicleStreet, body.vehicleState, body.userVehiclePrice, body.auctionStartingPrice,
			body.finalPrice, body.imagePrefix, body.primeImage, body.noOfImages, body.isTokenized, body.isSold]
		   )

          db.executeQuery(query, (result) => {
		res.send(result)
          })

})



app.all('/update-vehicle', (req, res) => {
	if (req.header('userId') == adminId) {
	var body = req.body
	var sql = ""
	if (body.setKey == 1) {
	    sql = "UPDATE Vehicles SET isApproved = ? WHERE postId = ?"
	} else if(body.setKey == 2) {
	    sql = "UPDATE Vehicles SET isTokenized = ? WHERE postId = ?"
	} else if(body.setKey == 3) {
	    sql = "UPDATE Vehicles SET isSold = ? WHERE postId = ?"
	} else {
	    res.status(404).send('Vehicle not exits')
	}
        var query = mysql.format(sql, [body.setValue, body.postId])

          db.executeQuery(query, (result) => {
	     if (body.setKey == 1){
		notification.notify(body.postId, body.title, body.brandName, vehicle, (response) => {})
	     }
             res.status(200).send(result)
          })
	} else { res.status(404).send('access denied') }
})




app.all('/delete-salvage/:postId', (req, res) => {
        if (req.header('userId') == adminId) {
        var sql = ""
        if (req.body.which == 1) {
            sql = "DELETE FROM Vehicles WHERE postId = ?"
        } else {
            sql = "DELETE FROM SpareParts WHERE postId = ?"
        }
        var query = mysql.format(sql, [req.params.postId])
          db.executeQuery(query, (result) => {
	     fs.rmdir(`./uploads/${req.params.postId}`, { recursive: true }, (err) => {
    		if(err){ result.errorMessage = err }
	     });
             res.status(200).send(result)
          })
        } else { res.status(404).send('access denied') }
})






app.all('/insert-spare-part', (req, res) => {
	var body = req.body
	var sql = "INSERT INTO SpareParts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	var query = mysql.format(sql, [body.userId, body.postId, body.postDate, body.brandName, body.title, body.description,
		body.ownerNumber, body.address, body.price, 0, body.isSold, body.imagePrefix, body.primeImage, body.noOfImages])

	db.executeQuery(query, (result) => {
             res.status(200).send(result)
          })
})



app.all('/update-spare-part', (req, res) => {
        if (req.header('userId') == adminId) {
	var body = req.body
        var sql = ""
        if (body.setKey == 1) {
            sql = "UPDATE SpareParts SET isApproved = ? WHERE postId = ?"
        } else if(body.setKey == 3) {
            sql = "UPDATE SpareParts SET isSold = ? WHERE postId = ?"
        } else {
	    res.status(404).send('Spare Part not exists')
	}
        var query = mysql.format(sql, [body.setValue, body.postId])

          db.executeQuery(query, (result) => {
	     if (body.setKey == 1) {
	        notification.notify(body.postId, body.title, body.brandName, sparePart, (response) =>  {})
	     }
             res.status(200).send(result)
          })
        } else { res.status(404).send('access denied') }
})


app.all('/upload-image', (req, res) => {
	var error = undefined
	var data = req.body.image
	var postId = req.body.postId
	var imageName = req.body.imageName
	var path = `./uploads/${postId}/`
//        var matches = data.replace(/^data:image\/\w+;base64,/, '')
	if (!fs.existsSync(path)) {
	    fs.mkdir(path, err => { error = err })
	}

	if (!error) {
	    var image = Buffer.from(data, 'base64')
	    fs.writeFile(`${path}${imageName}.jpeg`, image, 'base64', err => {
		if (err) {
		   res.send(false)
	  	} else {
		   res.send(true)
		}
	    })
	} else {
	   res.send(false)
	}
})



app.all('/get-image/:postId/:imageName', (req, res) => {
     var imagePath = `./uploads/${req.params.postId}/${req.params.imageName}.jpeg`

     fs.readFile(imagePath, (err, data) => {
	if (err) return res.send('unable to reload image')

	res.writeHead(200, {'Content-Type': 'image/jpg'});
        res.end(data,'Base64');
   })
})



// start node server
const port = 3000
app.timeout = 600000
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`)
})

// error handler for unmatched routes or api calls
app.use((req, res, next) => {
  res.status(404).send("No Such File Exist")
})

module.exports = app
