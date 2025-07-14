// Usage: node scripts/list-usernames.js

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config();

// Replace with your Convex deployment URL or use env variable
const convexUrl = process.env.CONVEX_URL || "http://localhost:3210";

async function main() {
  const client = new ConvexHttpClient(convexUrl);
  try {
    const users = await client.query("users:listUsernames", {});
    console.log("All users:");
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: '${u.username}' | Email: ${u.email}`);
    });
  } catch (err) {
    console.error("Error fetching usernames:", err);
  }
}

main(); 