// lib/mockData.ts
import type { Group, Friend, Activity, DashboardSummary } from "@/types";

export const mockSummary: DashboardSummary = {
  totalOwed: 3540,
  totalOwing: 1200,
  monthlyShared: 8920,
};

export const mockGroups: Group[] = [
  {
    id: "g1",
    name: "Flat 4B",
    emoji: "🏠",
    description: "Rent & utilities",
    members: 4,
    totalSpent: 24500,
    yourShare: 6125,
    netBalance: 800,
    currency: "₹",
    category: "Home",
  },
  {
    id: "g2",
    name: "Goa Trip 🌊",
    emoji: "✈️",
    description: "Jan 2025",
    members: 6,
    totalSpent: 42800,
    yourShare: 7133,
    netBalance: -1200,
    currency: "₹",
    category: "Travel",
  },
  {
    id: "g3",
    name: "Office Lunch",
    emoji: "🍱",
    description: "Weekly lunches",
    members: 5,
    totalSpent: 6200,
    yourShare: 1240,
    netBalance: 540,
    currency: "₹",
    category: "Food",
  },
];

export const mockFriends: Friend[] = [
  {
    id: "f1",
    name: "Rohan Kapoor",
    email: "rohan@example.com",
    initials: "RK",
    avatarColor: "rgba(255,79,121,0.15)",
    balance: 500,   // owes you
  },
  {
    id: "f2",
    name: "Priya Shah",
    email: "priya@example.com",
    initials: "PS",
    avatarColor: "rgba(74,222,128,0.12)",
    balance: -340,  // you owe
  },
  {
    id: "f3",
    name: "Mehul Vora",
    email: "mehul@example.com",
    initials: "MV",
    avatarColor: "rgba(239,159,39,0.15)",
    balance: 1200,  // owes you
  },
  {
    id: "f4",
    name: "Ananya Singh",
    email: "ananya@example.com",
    initials: "AS",
    avatarColor: "rgba(175,169,236,0.2)",
    balance: 0,     // settled
  },
];

export const mockActivity: Activity[] = [
  {
    id: "a1",
    type: "expense",
    emoji: "🍕",
    emojiColor: "rgba(74,222,128,0.12)",
    title: "Pizza Night",
    description: "Rohan paid · Flat 4B · Equal split",
    amount: -320,
    timestamp: "2h ago",
  },
  {
    id: "a2",
    type: "expense",
    emoji: "⛽",
    emojiColor: "rgba(255,79,121,0.12)",
    title: "Fuel — Goa",
    description: "You paid · Goa Trip · Split 6 ways",
    amount: 1400,
    timestamp: "Yesterday",
  },
  {
    id: "a3",
    type: "expense",
    emoji: "💡",
    emojiColor: "rgba(239,159,39,0.12)",
    title: "Electricity bill",
    description: "Priya paid · Flat 4B · Equal split",
    amount: -340,
    timestamp: "2 days ago",
  },
  {
    id: "a4",
    type: "settlement",
    emoji: "✅",
    emojiColor: "rgba(74,222,128,0.12)",
    title: "Settlement received",
    description: "Mehul paid you via UPI",
    amount: 600,
    timestamp: "3 days ago",
  },
  {
    id: "a5",
    type: "expense",
    emoji: "🛒",
    emojiColor: "rgba(83,74,183,0.15)",
    title: "Groceries",
    description: "You paid · Flat 4B · Equal split",
    amount: 880,
    timestamp: "4 days ago",
  },
];