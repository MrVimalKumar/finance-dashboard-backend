require("dotenv").config();
const app = require("./app.js");
const connectDB = require("./src/config/database_config.js");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server Connected Successfully");
});