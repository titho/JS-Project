
require("dotenv").config();

const sql = require("mssql/msnodesqlv8");
const config = {  
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
      trustedConnection: true,
      instanceName: process.env.SQL_INSTANCE
    }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then( (pool: any) => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch( (err: Error) => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
  sql, poolPromise
}