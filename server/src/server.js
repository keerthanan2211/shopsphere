import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

await connectDB();
const server = createApp().listen(env.PORT, () => {
  console.log(`ShopSphere API on http://localhost:${env.PORT} (payments: ${env.PAYMENT_MODE})`);
});

// Finish in-flight requests and close the database cleanly on shutdown (Docker, Render, Ctrl+C)
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
