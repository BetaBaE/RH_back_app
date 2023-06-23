const { getConnection, getSql } = require("../database/connection");
const { RH_Renouvellement } = require("../database/querys");

exports.getRenouvellementCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(RH_Renouvellement.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createRenouvellement = async (obj) => {
  const {
    cin,
    Matricule,
    Qualification,
    Discription,
    Renouvellement,
    datefinRenouvellement,
  } = obj;
  try {
    const pool = await getConnection();
    console.log(obj);
    await pool
      .request()
      .input("cin", getSql().VarChar, cin)
      .input("Matricule", getSql().VarChar, Matricule)
      .input("Qualification", getSql().Int, Qualification)
      .input("Discription", getSql().VarChar, Discription)
      .input("Renouvellement", getSql().Date, Renouvellement)
      .input("datefinRenouvellement", getSql().Date, datefinRenouvellement)
      .query(RH_Renouvellement.insert);
  } catch (error) {
    console.log(error);
  }
};

exports.getRenouvellement = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["DateInsertion" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.id) {
      queryFilter += ` and LOWER(m.[id]) like(LOWER('%${filter.id}%'))`;
    }
    if (filter.NomComplet) {
      queryFilter += ` and LOWER(m.[NomComplet]) like(LOWER('%${filter.NomComplet}%'))`;
    }
    if (filter.Matricule) {
      queryFilter += ` and LOWER(m.[Matricule]) like(LOWER('%${filter.Matricule}%'))`;
    }
    if (filter.Qualification) {
      queryFilter += ` and m.[Qualification] = ${filter.Qualification}`;
    }
    if (filter.DateInsertion) {
      queryFilter += ` and LOWER(r.DateInsertion) like(LOWER('%${filter.DateInsertion}%'))`;
    }
    if (filter.Discription) {
      queryFilter += ` and LOWER(Discription) like(LOWER('%${filter.Discription}%'))`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    console.log(`${RH_Renouvellement.getAll} ${queryFilter} Order by ${
      sort[0]
    } ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`);
    const result = await pool.request().query(
      `${RH_Renouvellement.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    console.log(req.count);
    res.set(
      "Content-Range",
      `renouvellement ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
