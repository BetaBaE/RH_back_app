const { getConnection, getSql } = require("../database/connection");
const { RH_Members } = require("../database/querys");
const { createNewAssurance } = require("./assurance");
const { createRenouvellement } = require("./renouvellement");

exports.getMembersCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(RH_Members.getMemberCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getMembers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["DateFin" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.id) {
      queryFilter += ` and LOWER(id) like(LOWER('%${filter.id}%'))`;
    }
    if (filter.Matricule) {
      queryFilter += ` and LOWER(Matricule) like(LOWER('%${filter.Matricule}%'))`;
    }
    if (filter.NomComplet) {
      queryFilter += ` and LOWER(NomComplet) like(LOWER('%${filter.NomComplet}%'))`;
    }
    if (filter.Qualification) {
      queryFilter += ` and Qualification = ${filter.Qualification}`;
    }
    if (filter.TypeContrat) {
      queryFilter += ` and TypeContrat = '${filter.TypeContrat}'`;
    }
    if (filter.SituationActif) {
      queryFilter += ` and SituationActif = '${filter.SituationActif}'`;
    }
    if (filter.Discription) {
      queryFilter += ` and Discription like(LOWER('%${filter.Discription}%'))`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    const result = await pool.request().query(
      `${RH_Members.getAllMembers} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    console.log(req.count);
    res.set(
      "Content-Range",
      `members ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createNewMember = async (req, res) => {
  const {
    id,
    Matricule,
    NomComplet,
    Qualification,
    TypeContrat,
    DateEmbauche,
    DateFin,
    Discription,
    SituationActif,
    assurance,
    dateAssurance,
    Renouvellement,
  } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("Matricule", getSql().VarChar, Matricule)
      .input("id", getSql().VarChar, id)
      .input("NomComplet", getSql().VarChar, NomComplet)
      .input("Qualification", getSql().Int, Qualification)
      .input("TypeContrat", getSql().VarChar, TypeContrat)
      .input("DateEmbauche", getSql().Date, DateEmbauche)
      .input("DateFin", getSql().Date, DateFin)
      .input("Discription", getSql().VarChar, Discription)
      .input("SituationActif", getSql().VarChar, SituationActif)
      .input("Renouvellement", getSql().Date, Renouvellement)
      .query(RH_Members.addNewMember);

    console.log(id);
    await createNewAssurance(assurance, id, dateAssurance);

    res.json({
      id: "",
      cin: id,
      Matricule,
      NomComplet,
      Qualification,
      TypeContrat,
      DateEmbauche,
      DateFin,
      Discription,
      SituationActif,
      assurance,
      dateAssurance,
      Renouvellement,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params.id);
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Members.getMemberById);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

const getMemberBeforeUpdate = async (id) => {
  try {
    const pool = await getConnection();
    // console.log(req.params.id);
    const result = await pool
      .request()
      .input("id", getSql().VarChar, id)
      .query(RH_Members.getMemberById);
    console.log(result.recordset[0]);
    return result.recordset[0];
  } catch (error) {
    console.log(error);
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const pool = await getConnection();
    // console.log(req.params);
    pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(RH_Members.deleteMembers);
    return res.json({ id: "Member deleted" });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.updateMember = async (req, res) => {
  const {
    id,
    Matricule,
    NomComplet,
    Qualification,
    TypeContrat,
    DateEmbauche,
    DateFin,
    Discription,
    SituationActif,
    Renouvellement,
  } = req.body;
  if (
    id == null ||
    Matricule == null ||
    NomComplet == null ||
    Qualification == null ||
    TypeContrat == null ||
    DateEmbauche == null ||
    DateFin == null ||
    Discription == null ||
    SituationActif == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }

  try {
    const pool = await getConnection();

    let results = await pool
      .request()
      .input("id", getSql().VarChar, id)
      .input("Matricule", getSql().VarChar, Matricule)
      .input("NomComplet", getSql().VarChar, NomComplet)
      .input("Qualification", getSql().Int, Qualification)
      .input("TypeContrat", getSql().VarChar, TypeContrat)
      .input("DateEmbauche", getSql().Date, DateEmbauche)
      .input("DateFin", getSql().Date, DateFin)
      .input("Discription", getSql().VarChar, Discription)
      .input("SituationActif", getSql().VarChar, SituationActif)
      .input("Renouvellement", getSql().Date, Renouvellement)

      .query(RH_Members.updateMemberById);

    console.log(results);
    let obj = await getMemberBeforeUpdate(req.params.id);
    if (obj.Renouvellement != Renouvellement) {
      console.log(obj.Renouvellement);
      obj.cin = obj.id;
      await createRenouvellement(obj);
    }
    if (obj.Assurance)
      res.json({
        id,
        Matricule,
        NomComplet,
        Qualification,
        TypeContrat,
        DateEmbauche,
        DateFin,
        Discription,
        SituationActif,
        Renouvellement,
      });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getMembersChart = async (req, res) => {
  try {
    // console.log(queryFilter);
    const pool = await getConnection();
    const result = await pool.request().query(RH_Members.getMemberChart);
    console.log(result);
    // console.log(req.count);
    res.set("Content-Range", `members 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// {
//     "id": "22227",
//     "Matricule": "1999-01-01",
//     "NomComplet": "Sohaib Bakcha 22",
//     "Qualification": "TS",
//     "TypeContrat": "CDI",
//     "DateEmbauche": "2022-02-11T00:00:00.000Z",
//     "DateFin": "2022-01-01T00:00:00.000Z",
//     "Discription": "2022-01-01T00:00:00.000Z",
//     "SituationActif": "Actif",
//     "Renouvellement": "2022-02-11T00:00:00.000Z"
// }
