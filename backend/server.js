require("dotenv").config();

const http = require("http");
const { app } = require("./src/app");
const { connectDB } = require("./src/config/db");
const { env } = require("./src/config/env");
const MasterData = require("./utils/masterListData");

async function start() {
  try {
    await connectDB(env.MONGO_URI);

    await MasterData.masterListData();

    const server = http.createServer(app);

    const PORT = process.env.PORT || env.PORT || 4000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server not started:", err);
    process.exit(1);
  }
}

start();
