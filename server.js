const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
require("./config/mongo");

const cors = require("cors");
app.use(cors());

app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_DOMAIN],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("images"));

app.use(bodyParser.json());

app.get("/serverStatus", (req, res) => {
  res.send("Server is On");
});

app.use("/v1/api", require("./routes/index"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("");
  console.log("--------------------------");
  console.log(`-> PORT RUNNING ON ${PORT}`);
});