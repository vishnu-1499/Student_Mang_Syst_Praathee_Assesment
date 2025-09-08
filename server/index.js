const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const route = require("./router/userRoute");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/user", route);

(async () => {
  try {
    await db.authenticate();
    console.log("DB Connected..");

    await db.sync({ alter: true });
    console.log("All tables synced");

    app.listen(process.env.PORT, () => {
      console.log(`Server Connected to PORT: ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Database Connection Failed..", error);
  }
})();