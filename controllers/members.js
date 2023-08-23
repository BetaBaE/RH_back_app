const { getConnection, getSql } = require("../database/connection");
const { RH_Members } = require("../database/querys");
const { createNewAssurance } = require("./assurance");
const { createRenouvellement } = require("./renouvellement");
const html_to_pdf = require("html-pdf-node");
const fs = require('fs');
const { pool } = require("mssql");
const { log } = require("console");

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
      queryFilter += ` and LOWER(m.id) like(LOWER('%${filter.id}%'))`;
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
    datefinRenouvellement,
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
      .input("datefinRenouvellement", getSql().Date, datefinRenouvellement)
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
      datefinRenouvellement,
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
    datefinRenouvellement,
  } = req.body;
  if (
    id == null ||
    Matricule == null ||
    NomComplet == null ||
    Qualification == null ||
    TypeContrat == null ||
    DateEmbauche == null ||
    SituationActif == null
  ) {
    return res.status(400).json({ error: "all field is required" });
  }

  try {
    const pool = await getConnection();

    // let finRenouvellement = null;
    // if (datefinRenouvellement != null) {
    //   finRenouvellement = new Date(datefinRenouvellement);
    // }
    let dateRenouvellement = null;
    if (Renouvellement != null) {
      dateRenouvellement = new Date(Renouvellement);
    }

    let obj = await getMemberBeforeUpdate(req.params.id);

    console.log(typeof obj.Renouvellement, typeof dateRenouvellement);

    console.log(obj.Renouvellement, dateRenouvellement);
    console.log("***", obj.datefinRenouvellement, datefinRenouvellement);

    // if ( obj.Renouvellement.toString().split("T")[0] != dateRenouvellement.toString().split("T")[0] ) {
    if (typeof Renouvellement == "string") {
      if (obj.Renouvellement == null) {
        obj.cin = obj.id;
        obj.Discription = Discription;
        obj.Qualification = Qualification;
        obj.Renouvellement = dateRenouvellement;
        obj.datefinRenouvellement = datefinRenouvellement;
        console.log(obj.Renouvellement);
        await createRenouvellement(obj);
      } else if (
        new Date(Renouvellement).getTime() !=
        new Date(obj.Renouvellement).getTime()
      ) {
        obj.cin = obj.id;
        obj.Discription = Discription;
        obj.Qualification = Qualification;
        obj.Renouvellement = dateRenouvellement;
        obj.datefinRenouvellement = datefinRenouvellement;
        console.log(obj.Renouvellement);

        await createRenouvellement(obj);
      }
    }
    // if (obj.Renouvellement.getTime() != dateRenouvellement.getTime()) {
    //   obj.cin = obj.id;
    //   obj.Discription = Discription;
    //   obj.Qualification = Qualification;
    //   obj.Renouvellement = dateRenouvellement;
    //   obj.finRenouvellement = datefinRenouvellement;

    //   await createRenouvellement(obj);
    // }

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
      .input("datefinRenouvellement", getSql().Date, datefinRenouvellement)

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
      datefinRenouvellement,
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

const addZero = (num) => {
  let str = num.toString();
  if (str.length === 1) {
    //console.log("inside if:" + str.length);
    return "0" + "" + str;
  }
  return str;
};

exports.PrintInsertedFile = async (req, res) => {

  let options = { format: "A4" };

  let printData = {
    header: {},
    body: [],
    edit: false,
    path: "",
  };
  let filter = req.query.filter || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();
  result = await pool
    .request()
  .input("id", getSql().VarChar, req.params.id)
  .query(RH_Members.printMembersFicheInsertion);
  printData.body = result.recordset;
  //  res.json(result.recordset[0]);


    let date = new Date();

    //console.log(addZero(1));

    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDate());
    let hour = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    let sec = addZero(date.getSeconds());

    let concat = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;

    let currentDate = new Date();
    let today = `${addZero(currentDate.getDate())}/${addZero(
      currentDate.getMonth() + 1
    )}/${addZero(currentDate.getFullYear())}`;
    let trdata = ""
    printData.body.forEach((member, index) => {
      trdata += `
      <tr class="information">
      <td colspan="2">
          <table>
          <tr>
                  <td>
                     nom complet: ${member.NomComplet}
                  </td>
                  <td>
                     cin: ${member.id}
                  </td>
               </tr>
          </table>
      </td>
  </tr>

  <tr class="item">
  <td>Cin:</td>
  <td>${member.id} </td>
</tr>
  <tr class="item">
      <td>Qualification:</td>
      <td>${member.Qualification} </td>
  </tr>
  <tr class="item">
      <td>type de contrat:</td>
      <td> ${member.TypeContrat} </td>
  </tr>

</table>
        `;
    });
    let html = `
    <!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Fiche d'insertion</title>
    <style>
        .invoice-box {
            max-width: 800px;
            height: 1000px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica';
            color: #555;
        }

        .margin-top {
            margin-top: 50px;
        }

        .justify-center {
            text-align: center;
        }

        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }

        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }

        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }

        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }

        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }

        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }

        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }

        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }

        .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
        }

        .invoice-box table tr.item.last td {
            border-bottom: none;
        }

        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }

        @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
                width: 100%;
                display: block;
                text-align: center;
            }

            .invoice-box table tr.information table td {
                width: 100%;
                display: block;
                text-align: center;
            }
        }
    </style>
</head>

<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title"><img class="logo" src="./logo.png" alt ="ATNER" style="width:100%; max-width:156px;"></td>
                            <td>
                                Rabat le : ${today}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            ${trdata}
        <br />
        <hr />
        <p class="margin-top" style="margin-top:550px">singature: </p>

    </div>
</body>

</html>
    `;
    fs.writeFileSync(`${__dirname}\\assets\\FicheInsertion.html`, html);

    let file = { url: `${__dirname}\\assets\\FicheInsertion.html` };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      console.log("PDF Buffer:-", pdfBuffer);
      let pdfPath =
      "\\\\10.200.1.20\\02_Exe\\00 - Reporting\\testPrintingInsertEmployeeFile\\" +
        'Fiche Insertion'+
        " " +
        concat +
        ".pdf";
      fs.writeFileSync(pdfPath, pdfBuffer);
      printData.path = pdfPath;
      printData.edit = true;
      
      console.log("fin", __dirname);
      console.log(concat)
      console.log(printData.body[0])
      console.log(trdata)
      

      
      res.set("Content-Range", `Members 0 - 1/1`);
      res.json(printData.body);
    });
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};