require("dotenv").config();

const http = require("http");
const { app } = require("./src/app");
const { connectDB } = require("./src/config/db");
const MasterData = require("./utils/masterListData");

const PORT = process.env.PORT || 4000;

async function start() {
  const server = http.createServer(app);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in Render Environment Variables");
    }

    await connectDB(mongoUri);
    await MasterData.masterListData();
  } catch (err) {
    console.error("Startup error:", err?.message || err);
  }
}

start();
