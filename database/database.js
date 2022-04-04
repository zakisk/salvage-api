
const { createPool } = require("mysql")

const config = {
    port : 3306,
    host : "localhost",
    user: "root",
    password: "Zaki@9254",
    database: "testDatabase"’,
    connectionLimit: 5,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
    waitForConnections: true, // Default: true
    queueLimit: 0
}

module.exports.init = function() {
		    return createPool(config)
		}
