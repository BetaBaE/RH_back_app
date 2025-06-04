const sql = require("mssql");
const sql2 = require("mssql/msnodesqlv8");
const dbSettings2 = {
  database: "APP_RH",
  server: "SBAKCHA-PC",
  driver: "msnodesqlv8",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 300000,
  },
  options: {
    trustedConnection: true,
    requestTimeout: 300000, // Augmenter le délai d'attente
  },
};

exports.getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings2);
    return pool;
  } catch (error) {
    console.error(error);
  }
};

exports.getSql = () => {
  return sql;
};
