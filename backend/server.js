require("dotenv").config();

const http = require("http");
const { app } = require("./src/app");
const { connectDB } = require("./src/config/db");
const { env } = require("./src/config/env");

async function start() {
  try {
    await connectDB(env.MONGO_URI);

    const server = http.createServer(app);
    server.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("Server not started due to DB error");
    process.exit(1);
  }
}

start();
