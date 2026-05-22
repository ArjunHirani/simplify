// types/index.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  upiId?: string | null;
  profileImage?: string | null;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  members: number;
  totalSpent: number;
  yourShare: number;
  netBalance: number;   // positive = owed to you, negative = you owe
  currency: string;
  category: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;  // hex bg color
  balance: number;      // positive = they owe you, negative = you owe them
}

export type ActivityType = "expense" | "payment" | "settlement" | "group";

export interface Activity {
  id: string;
  type: ActivityType;
  emoji: string;
  emojiColor: string;
  title: string;
  description: string;
  amount: number;       // positive = you received/are owed, negative = you owe
  timestamp: string;    // "2h ago", "Yesterday", etc.
}

export interface DashboardSummary {
  totalOwed: number;    // others owe you
  totalOwing: number;   // you owe others
  monthlyShared: number;
}