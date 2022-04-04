
const mysql = require('mysql')
const admin = require('./admin').admin
const db = require('../query/executeQuery')

module.exports.notify = function(postId, title, body, type, onComplete) {
	var query = "SELECT tokenId FROM NotificationTokens"
        db.executeQuery(query, (result) => {
        	var tokens = []
        	result.forEach((x) => {
           	    tokens.push(x.tokenId)
        	})
		const options = {
    		   priority: 'high',
    		   timeToLive: 60 * 60 * 24, // 1 day
  		}

		const payload = {
    		     tokens: tokens,
    		     data: {
        	        title: title,
        	        body: body,
		        postId: postId,
		        type: type
     		     },
    		     options: options
		}
        	admin.messaging().sendMulticast(payload)
        	.then((response) => { onComplete(response) })
        	.catch((err) => { onComplete(err) })

        })

}
