import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();
async function main() {
  // Create candidates
  const candidates = [
    { name: "Srinivas", email: "srinivas@email.com", experience: 3 },
    { name: "Rama", email: "rama@email.com", experience: 2 },
    { name: "Ramesh", email: "ramesh@email.com", experience: 5 },
    { name: "Suresh", email: "suresh@email.com", experience: 4 },
    { name: "Mahender", email: "mahender@email.com", experience: 6 },
    { name: "Priya", email: "priya@email.com", experience: 3 },
    { name: "Varshitha", email: "varshitha@email.com", experience: 2 },
    { name: "Ananya", email: "ananya@email.com", experience: 1 },
  ];
  for (const c of candidates) {
    const existing = await p.candidate.findFirst({ where: { email: c.email } });
    if (existing) { console.log(`${c.name} already exists`); continue; }
    await p.candidate.create({ data: { name: c.name, email: c.email, status: "APPLIED", experience: c.experience } });
    console.log(`Candidate: ${c.name}`);
  }

  // Create trainings + assign mandatory to all employees
  const existingTrainings = await p.training.count();
  if (existingTrainings === 0) {
    const tData = [
      { title: "Workplace Safety & Compliance", description: "Mandatory workplace safety training", category: "Compliance", mandatory: true, duration: 2 },
      { title: "Cybersecurity Awareness", description: "Best practices for data security", category: "Compliance", mandatory: true, duration: 3 },
      { title: "AI Ethics & Responsible AI Usage", description: "Understanding ethical AI usage", category: "Compliance", mandatory: true, duration: 2 },
      { title: "Effective Communication Skills", description: "Improve workplace communication", category: "Professional Development", mandatory: false, duration: 4 },
      { title: "Leadership & Management", description: "Develop leadership skills", category: "Leadership", mandatory: false, duration: 6 },
      { title: "Data Privacy & GDPR", description: "Understanding data protection regulations", category: "Compliance", mandatory: true, duration: 2 },
      { title: "Diversity & Inclusion", description: "Building an inclusive workplace culture", category: "Compliance", mandatory: true, duration: 2 },
    ];
    for (const t of tData) await p.training.create({ data: t });
    console.log("Created 7 trainings");

    const mandatory = await p.training.findMany({ where: { mandatory: true } });
    const employees = await p.employee.findMany();
    let assigned = 0;
    for (const emp of employees) {
      for (const t of mandatory) {
        const existing = await p.trainingAssignment.findUnique({
          where: { employeeId_trainingId: { employeeId: emp.id, trainingId: t.id } },
        });
        if (!existing) {
          await p.trainingAssignment.create({ data: { employeeId: emp.id, trainingId: t.id, status: "ASSIGNED" } });
          assigned++;
        }
      }
    }
    console.log(`Assigned ${assigned} mandatory trainings`);
  } else {
    console.log("Trainings already exist");
  }

  // Schedule interviews for candidates
  const cands = await p.candidate.findMany();
  const types = ["Technical", "HR", "Cultural"];
  let count = 0;
  for (const c of cands) {
    const existing = await p.interview.findFirst({ where: { candidateId: c.id } });
    if (existing) { console.log(`${c.name} already has interview`); continue; }
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 14) + 1);
    await p.interview.create({
      data: { candidateId: c.id, scheduledAt, type: types[count % 3], status: "SCHEDULED", panelMembers: "Srikar, Srivardhan" },
    });
    await p.candidate.update({ where: { id: c.id }, data: { status: "INTERVIEW" } });
    console.log(`Interview: ${c.name} on ${scheduledAt.toLocaleDateString()}`);
    count++;
  }

  console.log("\nDone!");
  await p.$disconnect();
}
main();