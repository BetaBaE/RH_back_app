const express = require("express");
const app = express();
const morgen = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
  })
);
app.use(cors());
dotenv.config();

// // middelware
app.use(morgen("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

const Members = require("./routes/members");
const Qualification = require("./routes/qualification");
const Renouvellement = require("./routes/renouvellement");
const Assurance = require("./routes/assurance");
const User = require("./routes/users");

app.use("/", Members);
app.use("/", Qualification);
app.use("/", Renouvellement);
app.use("/", Assurance);
app.use("/", User);


const port = process.env.PORT || 8081;


app.listen(port, () => {
  console.log(`Node API listening to port : ${port}`);
});
