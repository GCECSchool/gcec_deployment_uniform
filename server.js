const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
require("dotenv").config();
const path = require("path");

const itemRoutes = require("./routes/itemRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/cart", cartRoutes);

// Static file
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server run on PORT ${PORT} && Database connected`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
