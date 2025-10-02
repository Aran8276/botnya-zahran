import http from "node:http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = http.createServer(async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch users from database." }));
  }
});

server.listen(4000, () => {
  console.log("Server running at http://localhost:4000/");
});
