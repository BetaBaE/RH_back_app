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
  
    const pool = await getConnection();
    const result = await pool.request().query(
      `${RH_Members.getAllMembers} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

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
   
    const result = await pool
      .request()
      .input("id", getSql().VarChar, id)
      .query(RH_Members.getMemberById);

    return result.recordset[0];
  } catch (error) {
    console.log(error);
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const pool = await getConnection();
  
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
    SituationActif == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }

  try {
    const pool = await getConnection();
    let dateRenouvellement = null
    if(Renouvellement != null){
       dateRenouvellement = new Date(Renouvellement)
    }
    let obj = await getMemberBeforeUpdate(req.params.id);

    console.log(typeof obj.Renouvellement,typeof dateRenouvellement);
    console.log( obj.Renouvellement, dateRenouvellement);

    // if ( obj.Renouvellement.toString().split("T")[0] != dateRenouvellement.toString().split("T")[0] ) {
    if ( obj.Renouvellement.getTime() != dateRenouvellement.getTime() ) {

      obj.cin = obj.id;
      obj.Discription = Discription
      obj.Qualification = Qualification
      obj.Renouvellement = dateRenouvellement

      await createRenouvellement(obj);
    }

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
    // console.log(req.count);
    res.set("Content-Range", `members 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
