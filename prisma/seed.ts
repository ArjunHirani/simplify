// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean existing data ──
  await prisma.notification.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expenseParticipant.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // ── Create users ──
  const passwordHash = await bcrypt.hash("password123", 12);

  const arjun = await prisma.user.create({
    data: {
      fullName: "Arjun Hirani",
      email: "arjun@example.com",
      passwordHash,
      upiId: "arjun@upi",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      fullName: "Rohan Kapoor",
      email: "rohan@example.com",
      passwordHash,
      upiId: "rohan@upi",
    },
  });

  const priya = await prisma.user.create({
    data: {
      fullName: "Priya Shah",
      email: "priya@example.com",
      passwordHash,
    },
  });

  const mehul = await prisma.user.create({
    data: {
      fullName: "Mehul Vora",
      email: "mehul@example.com",
      passwordHash,
    },
  });

  console.log("✅ Users created");

  // ── Create groups ──
  const flat4b = await prisma.group.create({
    data: {
      name: "Flat 4B",
      emoji: "🏠",
      description: "Rent & utilities",
      createdById: arjun.id,
      members: {
        create: [
          { userId: arjun.id,  role: "admin" },
          { userId: rohan.id,  role: "member" },
          { userId: priya.id,  role: "member" },
          { userId: mehul.id,  role: "member" },
        ],
      },
    },
  });

  const goaTrip = await prisma.group.create({
    data: {
      name: "Goa Trip 🌊",
      emoji: "✈️",
      description: "Jan 2025",
      createdById: arjun.id,
      members: {
        create: [
          { userId: arjun.id,  role: "admin" },
          { userId: rohan.id,  role: "member" },
          { userId: priya.id,  role: "member" },
          { userId: mehul.id,  role: "member" },
        ],
      },
    },
  });

  console.log("✅ Groups created");

  // ── Create expenses ──
  const pizza = await prisma.expense.create({
    data: {
      groupId:   flat4b.id,
      paidById:  rohan.id,
      title:     "Pizza Night",
      amount:    1280,
      category:  "Food",
      splitType: "equal",
      date:      new Date(Date.now() - 2 * 60 * 60 * 1000),
      participants: {
        create: [
          { userId: arjun.id, owedAmount: 320 },
          { userId: rohan.id, owedAmount: 320, paidAmount: 1280 },
          { userId: priya.id, owedAmount: 320 },
          { userId: mehul.id, owedAmount: 320 },
        ],
      },
    },
  });

  const fuel = await prisma.expense.create({
    data: {
      groupId:   goaTrip.id,
      paidById:  arjun.id,
      title:     "Fuel — Goa",
      amount:    5600,
      category:  "Travel",
      splitType: "equal",
      date:      new Date(Date.now() - 24 * 60 * 60 * 1000),
      participants: {
        create: [
          { userId: arjun.id,  owedAmount: 1400, paidAmount: 5600 },
          { userId: rohan.id,  owedAmount: 1400 },
          { userId: priya.id,  owedAmount: 1400 },
          { userId: mehul.id,  owedAmount: 1400 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      groupId:   flat4b.id,
      paidById:  priya.id,
      title:     "Electricity bill",
      amount:    1360,
      category:  "Utilities",
      splitType: "equal",
      date:      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      participants: {
        create: [
          { userId: arjun.id, owedAmount: 340 },
          { userId: rohan.id, owedAmount: 340 },
          { userId: priya.id, owedAmount: 340, paidAmount: 1360 },
          { userId: mehul.id, owedAmount: 340 },
        ],
      },
    },
  });

  console.log("✅ Expenses created");

  // ── Create settlement ──
  await prisma.settlement.create({
    data: {
      payerId:    mehul.id,
      receiverId: arjun.id,
      amount:     600,
      method:     "upi",
      note:       "Settling Goa trip partial",
      groupId:    goaTrip.id,
    },
  });

  console.log("✅ Settlement created");

  // ── Create friendships ──
  await prisma.friendship.createMany({
    data: [
      { senderId: arjun.id, receiverId: rohan.id, status: "accepted" },
      { senderId: priya.id, receiverId: arjun.id, status: "accepted" },
      { senderId: arjun.id, receiverId: mehul.id, status: "accepted" },
    ],
  });

  console.log("✅ Friendships created");

  // ── Notifications ──
  await prisma.notification.createMany({
    data: [
      {
        userId: arjun.id,
        title:  "New expense added",
        body:   "Rohan added Pizza Night — you owe ₹320",
        type:   "expense",
      },
      {
        userId: arjun.id,
        title:  "Payment received",
        body:   "Mehul paid you ₹600 via UPI",
        type:   "payment",
      },
    ],
  });

  console.log("✅ Notifications created");
  console.log("\n🎉 Seed complete!");
  console.log("📧 Login with: arjun@example.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });