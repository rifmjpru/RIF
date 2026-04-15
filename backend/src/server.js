import { app } from "./app.js";
// import { connectToDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await connectToDatabase();

  app.listen(env.port, () => {
    console.log(`RIF backend listening on http://localhost:${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start RIF backend:", error.message);
  process.exit(1);
});
