exports.RH_Members = {
  getAllMembers: `select * from [dbo].[RH_Members] where 1=1`,
  getMemberById: "SELECT * FROM [dbo].[RH_Members] Where id = @id",
  addNewMember: `INSERT INTO [dbo].[RH_Members]
           ([Id]
           ,[Matricule]
           ,[NomComplet]
           ,[Qualification]
           ,[TypeContrat]
           ,[DateEmbauche]
           ,[DateFin]
           ,[Discription]
           ,[SituationActif]
           ,[Renouvellement])
     VALUES
           (@Id
           ,@Matricule
           ,@NomComplet
           ,@Qualification
           ,@TypeContrat
           ,@DateEmbauche
           ,@DateFin
           ,@Discription
           ,@SituationActif
           ,@Renouvellement)`,
  deleteMembers: "DELETE FROM [dbo].[RH_Members] Where Id = @id",
  updateMemberById: `UPDATE [dbo].[RH_Members]
   SET [Matricule] = @Matricule
      ,[NomComplet] = @NomComplet
      ,[Qualification] = @Qualification
      ,[TypeContrat] = @TypeContrat
      ,[DateEmbauche] = @DateEmbauche
      ,[DateFin] = @DateFin
      ,[Discription] = @Discription
      ,[SituationActif] =@SituationActif
      ,[Renouvellement] =@Renouvellement

      WHERE Id = @id`,
  getMemberCount: "select count(*) as count from [dbo].[RH_Members]",
  getMemberChart: `select count(*) as count,q.libelle from RH_Members m , RH_Qualifications q
                    where m.Qualification = q.id
                    group by q.libelle`,
};

exports.RH_Qualification = {
  addNewQualification: `INSERT INTO [dbo].[RH_Qualifications]
    ([libelle]) VALUES (@libelle)`,
  getAllQualification: `select * from [dbo].[RH_Qualifications]`,
  getQualificationById:
    "SELECT * FROM [dbo].[RH_Qualifications] Where id = @id",
  deleteQualifications: "DELETE FROM [dbo].[RH_Qualifications] Where Id = @id",
  updateQualifications:
    "UPDATE [dbo].[RH_Qualifications] SET [libelle] = @libelle WHERE Id = @id",
  getQualificationCount:
    "select count(*) as count from [dbo].[RH_Qualifications]",
};

exports.RH_Renouvellement = {
  getAll: `SELECT
   m.[id]
  ,m.[Matricule]
  ,r.[Qualification]
  ,[TypeContrat]
  ,[DateEmbauche]
  ,[DateFin]
  ,[Disciption] as Discription
  ,r.[Renouvellement] 
  ,r.DateInsertion
FROM [ATNER_DW].[dbo].[RH_Members] m,
[ATNER_DW].[dbo].[RH_Renouvellement] r
where m.id = r.cin
`,
  getCount: "select count(*) as count from [dbo].[RH_Renouvellement]",

  insert: `INSERT INTO [dbo].[RH_Renouvellement]
          ( [cin]
           ,[Matricule]
           ,[Renouvellement]
           ,[Disciption]
           ,[Qualification]
           )
     VALUES
           (@cin
           ,@Matricule
           ,@Renouvellement
           ,@Discription
           ,@Qualification)`,
};

exports.RH_Assurances = {
  getAll: `SELECT 
  r.id
  ,r.cin
  ,m.[Matricule]
  ,m.[NomComplet]
  ,Qualification
  ,m.[DateEmbauche]
  ,m.[DateFin]
,r.dateAssurance
,r.assure
FROM [ATNER_DW].[dbo].[RH_Members]m , RH_Assurances r
where r.cin = m.id`,
  getCount: `SELECT count(*) as count 
 FROM [dbo].[RH_Assurances] `,
  getAssurancesById:
    "SELECT * FROM [ATNER_DW].[dbo].[RH_Assurances] Where id = @id",
  insert: `INSERT INTO [dbo].[RH_Assurances]
  ([assure]
  ,[cin]
  ,[dateAssurance])
VALUES  (@assure,@cin,@dateAssurance)`,

  delete: "DELETE FROM [ATNER_DW].[dbo].[RH_Assurances] Where Id = @id",
  update: `UPDATE [dbo].[RH_Assurances] SET [assure] = @assure, [dateAssurance] = @dateAssurance
          WHERE id = @id  `,
};
