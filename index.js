const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const app = express();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Book Is On the way");
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
