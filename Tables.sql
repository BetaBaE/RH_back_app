
/* Table RH */
CREATE TABLE [dbo].[TableRH](
	[id] [varchar](50) NOT NULL,
	[Matricule] [varchar](50) NOT NULL,
	[NomComplet] [varchar](100) NOT NULL,
	[Qualification] [varchar](50) NOT NULL,
	[TypeContrat] [varchar](50) NOT NULL,
	[DateEmbauche] [date] NOT NULL,
	[DateFin] [date] NOT NULL,
	[Discription] [varchar](500) NOT NULL,
	[SituationActif] [varchar](50) NOT NULL,
	[Renouvellement] [date],
 CONSTRAINT [PK_TabelRH] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO