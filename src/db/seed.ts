import { db, pool } from "./index";
import { departments, skills, users, posts, helpRequests, helpRequestSkills, userSkills } from "./schema";
import { newId } from "../lib/id";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding...");

  const deptDefs = [
    { name: "Information Technology", description: "Systems, networks, and digital infrastructure across the AU." },
    { name: "Communications & Media", description: "Public messaging, press, and continental storytelling." },
    { name: "Peace & Security", description: "Conflict monitoring, early-warning, and mediation support." },
    { name: "Human Resources", description: "Talent, onboarding, and workplace wellbeing." },
    { name: "Economic Affairs", description: "Trade, integration, and continental economic policy." },
  ];

  const deptIds: Record<string, string> = {};
  for (const d of deptDefs) {
    const id = newId("dept");
    deptIds[d.name] = id;
    await db.insert(departments).values({ id, name: d.name, description: d.description });
  }

  const skillDefs = [
    ["Networking", "IT/Networking"],
    ["Cloud Infrastructure", "IT/Networking"],
    ["Graphic Design", "Design"],
    ["UI/UX Design", "Design"],
    ["Copywriting", "Writing"],
    ["Translation (FR/EN)", "Writing"],
    ["Data Analysis", "Data"],
    ["Data Visualization", "Data"],
    ["Event Logistics", "Logistics"],
    ["Procurement", "Logistics"],
    ["Video Editing", "Media"],
    ["Social Media Strategy", "Media"],
    ["Public Speaking", "Communications"],
    ["Policy Research", "Research"],
    ["Web Development", "IT/Networking"],
  ] as const;

  const skillIds: Record<string, string> = {};
  for (const [name, category] of skillDefs) {
    const id = newId("skill");
    skillIds[name] = id;
    await db.insert(skills).values({ id, name, category });
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Super Admin
  const superAdminId = newId("user");
  await db.insert(users).values({
    id: superAdminId,
    fullName: "Amara Diallo",
    email: "superadmin@auyouth.org",
    passwordHash,
    phone: "+251911000001",
    departmentId: deptIds["Human Resources"],
    programType: "FELLOW",
    title: "Platform Super Admin",
    bio: "Coordinates the AU Youth Engagement Platform across all departments.",
    systemRole: "SUPER_ADMIN",
    isPoster: true,
    isActive: true,
    emailVerified: true,
  });

  // Dept Admins
  const deptAdminDefs = [
    { name: "Kwame Mensah", dept: "Information Technology", title: "IT Department Admin" },
    { name: "Fatima Nur", dept: "Communications & Media", title: "Communications Department Admin" },
    { name: "Grace Uwase", dept: "Peace & Security", title: "Peace & Security Department Admin" },
  ];
  const deptAdminIds: Record<string, string> = {};
  for (const [i, da] of deptAdminDefs.entries()) {
    const id = newId("user");
    deptAdminIds[da.dept] = id;
    await db.insert(users).values({
      id,
      fullName: da.name,
      email: `deptadmin${i + 1}@auyouth.org`,
      passwordHash,
      phone: `+25191100000${i + 2}`,
      departmentId: deptIds[da.dept],
      programType: "FELLOW",
      title: da.title,
      bio: `Leads the ${da.dept} department's youth cohort.`,
      systemRole: "DEPT_ADMIN",
      isPoster: true,
      isActive: true,
      emailVerified: true,
    });
    await db.update(departments).set({ deptAdminId: id }).where(eq(departments.id, deptIds[da.dept]));
  }

  // Regular members with skills
  const memberDefs = [
    { name: "Tendai Moyo", dept: "Information Technology", program: "INTERN" as const, title: "Backend Intern", skills: ["Networking", "Cloud Infrastructure", "Web Development"], poster: false },
    { name: "Aisha Bello", dept: "Information Technology", program: "VOLUNTEER" as const, title: "IT Support Volunteer", skills: ["Networking"], poster: false },
    { name: "Samuel Okoro", dept: "Communications & Media", program: "INTERN" as const, title: "Media Intern", skills: ["Video Editing", "Social Media Strategy"], poster: true },
    { name: "Lindiwe Dube", dept: "Communications & Media", program: "FELLOW" as const, title: "Communications Fellow", skills: ["Copywriting", "Public Speaking"], poster: false },
    { name: "Youssef El-Amrani", dept: "Economic Affairs", program: "FELLOW" as const, title: "Policy Fellow", skills: ["Policy Research", "Data Analysis"], poster: false },
    { name: "Naledi Khumalo", dept: "Economic Affairs", program: "INTERN" as const, title: "Research Intern", skills: ["Data Analysis", "Data Visualization"], poster: false },
    { name: "Chidi Eze", dept: "Peace & Security", program: "VOLUNTEER" as const, title: "Field Volunteer", skills: ["Event Logistics", "Translation (FR/EN)"], poster: false },
    { name: "Mariam Toure", dept: "Human Resources", program: "INTERN" as const, title: "HR Intern", skills: ["Procurement", "Event Logistics"], poster: false },
    { name: "Daniel Kariuki", dept: "Information Technology", program: "FELLOW" as const, title: "Frontend Fellow", skills: ["Web Development", "UI/UX Design"], poster: false },
    { name: "Zara Ahmed", dept: "Communications & Media", program: "VOLUNTEER" as const, title: "Design Volunteer", skills: ["Graphic Design", "UI/UX Design"], poster: false },
  ];

  const memberIds: Record<string, string> = {};
  for (const [i, m] of memberDefs.entries()) {
    const id = newId("user");
    memberIds[m.name] = id;
    await db.insert(users).values({
      id,
      fullName: m.name,
      email: `member${i + 1}@auyouth.org`,
      passwordHash,
      phone: `+25191100${(100 + i).toString().slice(-4)}`,
      departmentId: deptIds[m.dept],
      programType: m.program,
      title: m.title,
      bio: `${m.title} passionate about contributing to the AU's mission.`,
      linkedin: `https://linkedin.com/in/${m.name.toLowerCase().replace(/\s+/g, "-")}`,
      systemRole: "MEMBER",
      isPoster: m.poster,
      isActive: true,
      emailVerified: true,
    });
    for (const skillName of m.skills) {
      await db.insert(userSkills).values({ userId: id, skillId: skillIds[skillName], proficiency: "INTERMEDIATE" });
    }
  }

  // Announcements
  const postDefs = [
    { title: "Welcome to the AU Youth Engagement Platform", body: "This platform connects interns, volunteers, and fellows across every AU department. Complete your profile and add your skills so colleagues can find and collaborate with you.", author: superAdminId, dept: null, pinned: true },
    { title: "IT Department: New Wi-Fi rollout this week", body: "The IT team is upgrading wireless access points across the building. Expect brief connectivity interruptions between 6-8am each morning this week.", author: deptAdminIds["Information Technology"], dept: deptIds["Information Technology"], pinned: false },
    { title: "Media cohort: submission deadline for the quarterly newsletter", body: "Please submit your department highlights for the quarterly youth newsletter by Friday. Reach out to the Communications team with any questions.", author: deptAdminIds["Communications & Media"], dept: deptIds["Communications & Media"], pinned: false },
    { title: "Peace & Security: early-warning training session", body: "A training session on early-warning monitoring tools will be held for all Peace & Security youth members next Tuesday.", author: deptAdminIds["Peace & Security"], dept: deptIds["Peace & Security"], pinned: false },
  ];
  for (const p of postDefs) {
    await db.insert(posts).values({
      id: newId("post"),
      title: p.title,
      body: p.body,
      authorId: p.author!,
      departmentId: p.dept,
      pinned: p.pinned,
    });
  }

  // Help requests
  const hr1 = newId("hr");
  await db.insert(helpRequests).values({
    id: hr1,
    title: "Intermittent networking issue in the Economic Affairs office",
    description: "Our department's shared printer keeps dropping off the network and a few laptops can't reach internal file shares. Need someone with networking experience to take a look.",
    requestedById: memberIds["Youssef El-Amrani"],
    departmentId: deptIds["Economic Affairs"],
    status: "OPEN",
  });
  await db.insert(helpRequestSkills).values({ helpRequestId: hr1, skillId: skillIds["Networking"] });

  const hr2 = newId("hr");
  await db.insert(helpRequests).values({
    id: hr2,
    title: "Need a short explainer video for the youth newsletter",
    description: "Looking for someone comfortable with video editing to help cut a 60-second explainer clip for this quarter's newsletter.",
    requestedById: memberIds["Lindiwe Dube"],
    departmentId: deptIds["Communications & Media"],
    status: "OPEN",
  });
  await db.insert(helpRequestSkills).values({ helpRequestId: hr2, skillId: skillIds["Video Editing"] });

  console.log("Seed complete.");
  console.log("Demo login (all users): password = Password123!");
  console.log("Super Admin: superadmin@auyouth.org");
  console.log("Dept Admins: deptadmin1@auyouth.org (IT), deptadmin2@auyouth.org (Comms), deptadmin3@auyouth.org (Peace&Sec)");
  console.log("Members: member1@auyouth.org ... member10@auyouth.org");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
