import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany({ select: { email: true, name: true, password: true } });
  for (const u of users) {
    const pw = u.email.split("@")[0] + "123";
    const match = await bcrypt.compare(pw, u.password);
    console.log(`${u.email} / ${pw} → ${match ? "OK" : "FAIL"}`);
  }
  await p.$disconnect();
}
main();