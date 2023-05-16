const { getConnection, getSql } = require("../database/connection");
const { RH_Assurances } = require("../database/querys");

exports.getAssurances = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["DateFin" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    // if (filter.id) {
    //   queryFilter += ` and LOWER(m.id) like(LOWER('%${filter.id}%'))`;
    // }
    // if (filter.cin) {
    //   queryFilter += ` and LOWER(Matricule) like(LOWER('%${filter.cin}%'))`;
    // }
    // if (filter.NomComplet) {
    //   queryFilter += ` and LOWER(NomComplet) like(LOWER('%${filter.NomComplet}%'))`;
    // }
    // if (filter.Qualification) {
    //   queryFilter += ` and Qualification = ${filter.Qualification}`;
    // }
    // if (filter.TypeContrat) {
    //   queryFilter += ` and TypeContrat = '${filter.TypeContrat}'`;
    // }
    // if (filter.SituationActif) {
    //   queryFilter += ` and SituationActif = '${filter.SituationActif}'`;
    // }
    // if (filter.Discription) {
    //   queryFilter += ` and Discription like(LOWER('%${filter.Discription}%'))`;
    // }
    console.log(queryFilter);
    const pool = await getConnection();
    const result = await pool.request().query(`${RH_Assurances.getAll}`);
    console.log(req.count);
    res.set(
      "Content-Range",
      `assurances ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createNewAssurance = async (assure, cin, dateAssurance) => {
  console.log({ assure, cin, dateAssurance });
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("assure", getSql().VarChar, assure)
      .input("cin", getSql().VarChar, cin)
      .input("dateAssurance", getSql().Date, dateAssurance)
      .query(RH_Assurances.insert);

    res.json({
      id: "",
      cin,
    });
  } catch (error) {
    console.log("test", error.message);
  }
};

exports.getAssurancesById = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params.id);
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Assurances.getAssurancesById);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.deleteAssurances = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params);
    pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Assurances.delete);

    return res.json({ id: "Assurance deleted" });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.updateAssurance = async (req, res) => {
  const { id, cin, assure, dateAssurance } = req.body;
  console.log(req.body);
  if (id == null || assure == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    let results = await pool
      .request()
      .input("id", getSql().Int, id)
      .input("cin", getSql().VarChar, cin)
      .input("assure", getSql().VarChar, assure)
      .input("dateAssurance", getSql().VarChar, dateAssurance)
      .query(RH_Assurances.update);

    res.status(200).json({
      id,
      cin,
      assure,
      dateAssurance,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
