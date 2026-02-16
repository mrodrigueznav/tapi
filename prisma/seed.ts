import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superadmin = await prisma.user.upsert({
    where: { clerkUserId: "clerk_test_superadmin" },
    create: {
      clerkUserId: "clerk_test_superadmin",
      email: "superadmin@example.com",
      name: "Super Admin",
      isSuperAdmin: true,
    },
    update: { isSuperAdmin: true },
  });
  console.log("Superadmin:", superadmin.id);

  const ownerUser = await prisma.user.upsert({
    where: { clerkUserId: "clerk_test_owner" },
    create: {
      clerkUserId: "clerk_test_owner",
      email: "owner@example.com",
      name: "Demo Owner",
    },
    update: {},
  });

  let company = await prisma.company.findFirst({
    where: { name: "Demo Company" },
  });
  if (!company) {
    company = await prisma.company.create({
      data: { name: "Demo Company", status: "ACTIVE" },
    });
  }
  console.log("Company:", company.id);

  await prisma.membership.upsert({
    where: {
      userId_companyId: { userId: ownerUser.id, companyId: company.id },
    },
    create: {
      userId: ownerUser.id,
      companyId: company.id,
      role: "OWNER",
    },
    update: { role: "OWNER" },
  });
  console.log("Membership OWNER for clerk_test_owner created");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
