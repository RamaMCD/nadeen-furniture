export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type TransactionType = "incoming" | "outgoing";

export type TransactionStatus = "completed" | "pending" | "cancelled";

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: TransactionType;
  quantity: number;
  status: TransactionStatus;
  createdAt: string;
  createdBy: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  incomingThisMonth: number;
  outgoingThisMonth: number;
}
