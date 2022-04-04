
const mysql = require("mysql")

module.exports.executeQuery = function(query, onComplete) {

  var con = mysql.createConnection({
    port : 3306,
    host: "localhost",
    user: "root",
    password: "Zaki@9254",
    database: "testDatabase"
  });

  con.connect((err) => {
    if (err) {
       onComplete("Database Connection Error : " + err)
    } else {
      con.query(query, (err, result, fields) => {
          if (err) {
             onComplete("Query Error : " + err)
          } else {

            onComplete(result)

             con.end((err) => {
                 if (err) {
                     console.log("Connection Ending Error : " + err)
                 } else {
                     console.log("Connection Terminated Successfully")
                 }
             })
          }
      })
    }
  })

}
