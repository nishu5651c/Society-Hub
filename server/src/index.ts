import { app } from "./app.js";
import { config } from "./config.js";
import { seedDevelopment } from "./devSeed.js";

async function main() {
  try {
    if (config.nodeEnv === "development") await seedDevelopment();
    app.listen(config.port, () => console.log(`SocietyHub API listening on http://localhost:${config.port}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

void main();
