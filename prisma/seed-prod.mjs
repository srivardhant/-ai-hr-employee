// Run: set env vars first in PowerShell, then: node prisma/seed-prod.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use DIRECT_URL for direct connection (required for schema ops & seeding)
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

async function main() {
  console.log("🌱 Seeding production database...");

  const existing = await prisma.employee.count();
  if (existing > 1) {
    console.log(`✅ Already seeded (${existing} employees). Nothing to do.`);
    return;
  }

  // 1. Update admin
  await prisma.employee.updateMany({
    where: { name: "Srivardhan" },
    data: { salary: 350000, position: "HR Director", department: "HR" },
  });
  const adminEmp = await prisma.employee.findFirst({ where: { name: "Srivardhan" } });

  // 2. Employees
  const employeeData = [
    { name: "Srikar",   email: "srikar@aihr.com",   role: "MANAGER",  gender: "Male",   dept: "Engineering", pos: "Engineering Manager",      salary: 280000, phone: "9876543210", joinDate: "2023-01-15" },
    { name: "Yuvan",    email: "yuvan@aihr.com",     role: "EMPLOYEE", gender: "Male",   dept: "Engineering", pos: "Senior Software Engineer",  salary: 145000, phone: "9876543211", joinDate: "2023-03-10" },
    { name: "Hemanth",  email: "hemanth@aihr.com",   role: "EMPLOYEE", gender: "Male",   dept: "Engineering", pos: "Software Engineer",         salary: 115000, phone: "9876543212", joinDate: "2023-06-01" },
    { name: "Srivally", email: "srivally@aihr.com",  role: "EMPLOYEE", gender: "Female", dept: "Design",      pos: "Lead UI/UX Designer",       salary: 130000, phone: "9876543213", joinDate: "2023-02-20" },
    { name: "Srujana",  email: "srujana@aihr.com",   role: "EMPLOYEE", gender: "Female", dept: "Marketing",   pos: "Marketing Manager",         salary: 125000, phone: "9876543214", joinDate: "2023-04-05" },
    { name: "Rahul",    email: "rahul@aihr.com",     role: "EMPLOYEE", gender: "Male",   dept: "Sales",       pos: "Senior Sales Executive",    salary: 110000, phone: "9876543215", joinDate: "2023-05-15" },
    { name: "Ananya",   email: "ananya@aihr.com",    role: "EMPLOYEE", gender: "Female", dept: "Engineering", pos: "QA Engineer",               salary: 105000, phone: "9876543216", joinDate: "2023-07-01" },
    { name: "Karthik",  email: "karthik@aihr.com",   role: "EMPLOYEE", gender: "Male",   dept: "Finance",     pos: "Finance Analyst",           salary: 120000, phone: "9876543217", joinDate: "2023-08-10" },
    { name: "Divya",    email: "divya@aihr.com",     role: "EMPLOYEE", gender: "Female", dept: "HR",          pos: "HR Specialist",             salary: 100000, phone: "9876543218", joinDate: "2023-09-01" },
    { name: "Vikram",   email: "vikram@aihr.com",    role: "MANAGER",  gender: "Male",   dept: "Sales",       pos: "Sales Manager",             salary: 200000, phone: "9876543219", joinDate: "2022-11-01" },
  ];

  const empMap = {};
  let empIdx = 2;
  for (const emp of employeeData) {
    let e = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!e) {
      await prisma.user.deleteMany({ where: { email: emp.email } });
      const user = await prisma.user.create({
        data: { email: emp.email, password: await bcrypt.hash(emp.name.toLowerCase() + "123", 10), name: emp.name, role: emp.role },
      });
      e = await prisma.employee.create({
        data: { userId: user.id, employeeId: `EMP-${String(empIdx).padStart(3, "0")}`, name: emp.name, email: emp.email, companyEmail: emp.email, phone: emp.phone, gender: emp.gender, department: emp.dept, position: emp.pos, salary: emp.salary, status: "ACTIVE", joinDate: new Date(emp.joinDate) },
      });
      empIdx++;
    }
    empMap[emp.name] = e;
    console.log(`  ✓ Employee: ${emp.name}`);
  }

  // Set manager relationships
  if (empMap["Srikar"] && adminEmp) await prisma.employee.update({ where: { id: empMap["Srikar"].id }, data: { managerId: adminEmp.id } });
  for (const n of ["Yuvan","Hemanth","Ananya"]) {
    if (empMap[n] && empMap["Srikar"]) await prisma.employee.update({ where: { id: empMap[n].id }, data: { managerId: empMap["Srikar"].id } });
  }
  if (empMap["Rahul"] && empMap["Vikram"]) await prisma.employee.update({ where: { id: empMap["Rahul"].id }, data: { managerId: empMap["Vikram"].id } });

  // 3. Job Openings
  const jobData = [
    { key:"swe",    title:"Senior Software Engineer",    department:"Engineering", description:"Build scalable backend systems and APIs.", requirements:"5+ years Go/Node.js, PostgreSQL, REST APIs", location:"Hyderabad / Remote", type:"Full-time", salaryMin:150000, salaryMax:250000, openings:2 },
    { key:"design", title:"Product Designer",            department:"Design",      description:"Design beautiful, intuitive product experiences.", requirements:"3+ years Figma, UX research, design systems", location:"Remote",           type:"Full-time", salaryMin:120000, salaryMax:180000, openings:1 },
    { key:"mktg",   title:"Digital Marketing Specialist",department:"Marketing",   description:"Drive growth through SEO, content and campaigns.", requirements:"2+ years digital marketing, Google Ads, SEO", location:"Hyderabad",         type:"Full-time", salaryMin:80000,  salaryMax:130000, openings:1 },
    { key:"sales",  title:"Enterprise Sales Executive",  department:"Sales",       description:"Identify and close enterprise SaaS deals.", requirements:"3+ years B2B SaaS sales, CRM tools", location:"Remote",           type:"Full-time", salaryMin:100000, salaryMax:160000, openings:2 },
    { key:"qa",     title:"QA Automation Engineer",      department:"Engineering", description:"Build and maintain automated test suites.", requirements:"2+ years Playwright/Cypress, TypeScript", location:"Hyderabad / Remote", type:"Full-time", salaryMin:90000,  salaryMax:140000, openings:1 },
  ];
  const jobMap = {};
  for (const jd of jobData) {
    let j = await prisma.jobOpening.findFirst({ where: { title: jd.title } });
    if (!j) j = await prisma.jobOpening.create({ data: { title:jd.title, department:jd.department, description:jd.description, requirements:jd.requirements, location:jd.location, type:jd.type, salaryMin:jd.salaryMin, salaryMax:jd.salaryMax, openings:jd.openings, status:"OPEN" } });
    jobMap[jd.key] = j;
    console.log(`  ✓ Job: ${jd.title}`);
  }

  // 4. Candidates
  const candData = [
    { name:"Srinivas Rao",    email:"srinivas.rao@gmail.com",    phone:"9100000001", exp:6, skills:"Go, PostgreSQL, Kubernetes, REST APIs",          status:"SHORTLISTED", score:87.5, jobKey:"swe",    source:"LinkedIn" },
    { name:"Ramesh Babu",     email:"ramesh.babu@gmail.com",     phone:"9100000002", exp:4, skills:"Node.js, MongoDB, React, TypeScript",            status:"INTERVIEW",   score:79.0, jobKey:"swe",    source:"Website" },
    { name:"Priya Sharma",    email:"priya.sharma@gmail.com",    phone:"9100000003", exp:3, skills:"Figma, UX research, Prototyping, Design Systems", status:"INTERVIEW",   score:91.0, jobKey:"design", source:"LinkedIn" },
    { name:"Varshitha Reddy", email:"varshitha.reddy@gmail.com", phone:"9100000004", exp:2, skills:"Figma, Sketch, Adobe XD, Wireframing",           status:"SCREENING",   score:68.0, jobKey:"design", source:"Referral" },
    { name:"Mahender Goud",   email:"mahender.goud@gmail.com",   phone:"9100000005", exp:5, skills:"Google Ads, SEO, Content Marketing, HubSpot",    status:"SHORTLISTED", score:82.0, jobKey:"mktg",   source:"LinkedIn" },
    { name:"Ananya Verma",    email:"ananya.verma@gmail.com",    phone:"9100000006", exp:1, skills:"Social Media, Canva, Google Analytics",          status:"APPLIED",     score:55.0, jobKey:"mktg",   source:"Website" },
    { name:"Suresh Kumar",    email:"suresh.kumar@gmail.com",    phone:"9100000007", exp:4, skills:"SaaS Sales, Salesforce, Negotiation, B2B",       status:"OFFERED",     score:88.5, jobKey:"sales",  source:"Referral" },
    { name:"Rama Krishnan",   email:"rama.krishnan@gmail.com",   phone:"9100000008", exp:3, skills:"Inside Sales, CRM, Outbound, Demo",              status:"INTERVIEW",   score:74.0, jobKey:"sales",  source:"LinkedIn" },
    { name:"Nikhil Joshi",    email:"nikhil.joshi@gmail.com",    phone:"9100000009", exp:5, skills:"Playwright, Cypress, TypeScript, CI/CD",         status:"EVALUATED",   score:86.0, jobKey:"qa",     source:"Website" },
    { name:"Kavitha Nair",    email:"kavitha.nair@gmail.com",    phone:"9100000010", exp:2, skills:"Selenium, Java, TestNG, JIRA",                   status:"SCREENING",   score:64.0, jobKey:"qa",     source:"LinkedIn" },
    { name:"Rohit Mehta",     email:"rohit.mehta@gmail.com",     phone:"9100000011", exp:7, skills:"Go, Microservices, AWS, gRPC",                   status:"REJECTED",    score:42.0, jobKey:"swe",    source:"Website" },
    { name:"Deepika Singh",   email:"deepika.singh@gmail.com",   phone:"9100000012", exp:4, skills:"Python, FastAPI, Docker, PostgreSQL",            status:"APPLIED",     score:73.0, jobKey:"swe",    source:"LinkedIn" },
  ];
  const candList = [];
  for (const c of candData) {
    let cand = await prisma.candidate.findFirst({ where: { email: c.email } });
    if (!cand) cand = await prisma.candidate.create({ data: { name:c.name, email:c.email, phone:c.phone, experience:c.exp, skills:c.skills, status:c.status, aiScreenScore:c.score, jobOpeningId:jobMap[c.jobKey]?.id||null, source:c.source } });
    candList.push({ ...cand, status: c.status });
    console.log(`  ✓ Candidate: ${c.name}`);
  }

  // 5. Interviews
  const itypes = ["HR Screening","Technical Interview","Cultural Review","Final Director Review"];
  let ii = 0;
  for (const c of candList.filter(c => ["INTERVIEW","EVALUATED","SHORTLISTED"].includes(c.status))) {
    const ex = await prisma.interview.findFirst({ where: { candidateId: c.id } });
    if (!ex) {
      const sat = new Date(); sat.setDate(sat.getDate() + (ii % 5) + 2); sat.setHours(10 + ii * 2, 0, 0, 0);
      await prisma.interview.create({ data: { candidateId:c.id, scheduledAt:sat, duration:[45,60,60,90][ii%4], type:itypes[ii%4], status:"SCHEDULED", panelMembers:ii%2===0?"Srikar, Srivardhan":"Vikram, Srivardhan", calendarSyncStatus:"PENDING" } });
      ii++;
    }
  }

  // 6. Evaluations
  for (const c of candList.filter(c => ["EVALUATED","OFFERED"].includes(c.status))) {
    const ex = await prisma.evaluation.findFirst({ where: { candidateId: c.id } });
    if (!ex) {
      const t=7.5+Math.random()*2, h=7+Math.random()*2.5, co=7+Math.random()*2, cu=7.5+Math.random()*2;
      await prisma.evaluation.create({ data: { candidateId:c.id, technicalScore:+t.toFixed(1), hrScore:+h.toFixed(1), communicationScore:+co.toFixed(1), culturalFitScore:+cu.toFixed(1), overallScore:+((t+h+co+cu)/4).toFixed(1), recommendation:t>8.5?"STRONG_HIRE":"HIRE", aiSummary:"Strong candidate. Recommended for hire." } });
    }
  }

  // 7. Offers
  for (const c of candList.filter(c => c.status === "OFFERED")) {
    const ex = await prisma.offer.findFirst({ where: { candidateId: c.id } });
    if (!ex) {
      const j=new Date(); j.setDate(j.getDate()+30);
      const e=new Date(); e.setDate(e.getDate()+14);
      await prisma.offer.create({ data: { candidateId:c.id, salary:160000, joiningDate:j, department:"Sales", position:"Enterprise Sales Executive", benefits:"Health insurance, 30 paid leaves, WFH", status:"SENT", expiresAt:e } });
    }
  }

  // 8. Trainings
  const tdata = [
    {title:"Workplace Safety & Compliance",       category:"Compliance",             mandatory:true,  duration:2},
    {title:"Cybersecurity Awareness",             category:"Compliance",             mandatory:true,  duration:3},
    {title:"AI Ethics & Responsible AI Usage",   category:"Compliance",             mandatory:true,  duration:2},
    {title:"Data Privacy & GDPR",                category:"Compliance",             mandatory:true,  duration:2},
    {title:"Diversity & Inclusion",              category:"Compliance",             mandatory:true,  duration:2},
    {title:"Effective Communication Skills",     category:"Professional Development",mandatory:false, duration:4},
    {title:"Leadership & Management Essentials", category:"Leadership",             mandatory:false, duration:6},
    {title:"Advanced TypeScript & Node.js",      category:"Technical",              mandatory:false, duration:8},
  ];
  const tmap = {};
  for (const t of tdata) {
    let tr = await prisma.training.findFirst({ where:{title:t.title} });
    if (!tr) tr = await prisma.training.create({ data:{...t, description:t.title} });
    tmap[t.title] = tr;
  }
  const allEmps = await prisma.employee.findMany();
  const mandatory = Object.values(tmap).filter(t=>t.mandatory);
  for (const emp of allEmps) {
    for (const t of mandatory) {
      const ex = await prisma.trainingAssignment.findUnique({ where:{employeeId_trainingId:{employeeId:emp.id,trainingId:t.id}} });
      if (!ex) {
        const statuses=["COMPLETED","COMPLETED","IN_PROGRESS","ASSIGNED"];
        const st=statuses[Math.floor(Math.random()*statuses.length)];
        await prisma.trainingAssignment.create({ data:{employeeId:emp.id,trainingId:t.id,status:st,progress:st==="COMPLETED"?100:st==="IN_PROGRESS"?60:0,completedAt:st==="COMPLETED"?new Date():undefined} });
      }
    }
  }

  // 9. Payroll — last 3 months
  const now = new Date();
  for (const emp of allEmps) {
    for (let i=1;i<=3;i++) {
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const month=d.getMonth()+1, year=d.getFullYear();
      const ex = await prisma.payroll.findUnique({ where:{employeeId_month_year:{employeeId:emp.id,month,year}} });
      if (!ex) {
        const allow=emp.salary*0.2, tax=emp.salary*0.1, ded=emp.salary*0.05, bon=i===1?emp.salary*0.1:0;
        await prisma.payroll.create({ data:{employeeId:emp.id,month,year,baseSalary:emp.salary,allowances:allow,tax,deductions:ded,bonuses:bon,netPay:emp.salary+allow-tax-ded+bon,status:"PAID",paidAt:new Date(year,month-1,28)} });
      }
    }
  }

  // 10. Performance Reviews
  for (const emp of allEmps) {
    const ex = await prisma.performanceReview.findFirst({ where:{employeeId:emp.id} });
    if (!ex) {
      const rating=+(3.5+Math.random()*1.5).toFixed(1);
      await prisma.performanceReview.create({ data:{employeeId:emp.id,quarter:1,year:now.getFullYear(),rating,feedback:rating>=4.5?"Exceptional performance.":rating>=3.5?"Strong contributor.":"Good effort.",goals:JSON.stringify(["Complete Q2 roadmap","Improve test coverage"]),achievements:JSON.stringify(["Shipped 3 features","Zero critical bugs"]),status:"COMPLETED",reviewedBy:"Srivardhan"} });
    }
  }

  // 11. Recognitions
  for (const [name, title, category, points] of [
    ["Yuvan","Best Technical Delivery","Innovation",500],
    ["Srivally","Outstanding Design Quality","Teamwork",400],
    ["Srujana","Marketing Campaign MVP","Leadership",350],
    ["Rahul","Top Sales Performer","Customer",600],
    ["Srikar","Best Engineering Manager","Leadership",750],
  ]) {
    const emp = await prisma.employee.findFirst({ where:{name} });
    if (emp) {
      const ex = await prisma.recognition.findFirst({ where:{employeeId:emp.id,title} });
      if (!ex) await prisma.recognition.create({ data:{employeeId:emp.id,awardedBy:"Srivardhan",title,category,points,description:`Awarded for outstanding ${category.toLowerCase()}.`} });
    }
  }

  const finalEmps = await prisma.employee.count();
  const finalCands = await prisma.candidate.count();
  console.log(`\n✅ Seed complete! Employees: ${finalEmps}, Candidates: ${finalCands}`);
}

main()
  .catch(e => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
