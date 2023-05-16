const { getConnection, getSql } = require("../database/connection");
const { RH_Qualification } = require("../database/querys");

exports.getQualificationsCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(RH_Qualification.getQualificationCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createNewQualification = async (req, res) => {
  const { libelle } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("libelle", getSql().VarChar, libelle)
      .query(RH_Qualification.addNewQualification);

    res.json({
      id: libelle,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getQualifications = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    // let sort = req.query.sort || '["DateFin" , "ASC"]';
    range = JSON.parse(range);
    // sort = JSON.parse(sort);
    const pool = await getConnection();
    const result = await pool.request().query(
      /*
      `${*/ RH_Qualification.getAllQualification /*} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`*/
    );
    console.log(req.count);
    res.set(
      "Content-Range",
      `qualification ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getQualificationById = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params);
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Qualification.getQualificationById);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.deleteQualifications = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params);
    pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Qualification.deleteQualifications);
    return res.json({ id: "Qualification deleted" });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.updateQualification = async (req, res) => {
  const { id, libelle } = req.body;
  if (id == null || libelle == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    let results = await pool
      .request()
      .input("id", getSql().Int, id)
      .input("libelle", getSql().VarChar, libelle)

      .query(RH_Qualification.updateQualifications);

    console.log(results);

    res.json({
      id,
      libelle,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
