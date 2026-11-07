import type { DashboardStats, Transaction } from "@/types";

export const mockDashboardStats: DashboardStats = {
  totalProducts: 1284,
  totalStock: 38420,
  incomingThisMonth: 5240,
  outgoingThisMonth: 3120,
};

export const mockMonthlyFlow = [
  { month: "Jan", incoming: 3200, outgoing: 2100 },
  { month: "Feb", incoming: 4100, outgoing: 2800 },
  { month: "Mar", incoming: 3800, outgoing: 3400 },
  { month: "Apr", incoming: 5200, outgoing: 3900 },
  { month: "May", incoming: 4600, outgoing: 4200 },
  { month: "Jun", incoming: 5240, outgoing: 3120 },
];

export const mockStockByCategory = [
  { name: "Electronics", value: 12400, fill: "hsl(var(--chart-1))" },
  { name: "Furniture", value: 8200, fill: "hsl(var(--chart-2))" },
  { name: "Tools", value: 6100, fill: "hsl(var(--chart-3))" },
  { name: "Packaging", value: 7800, fill: "hsl(var(--chart-4))" },
  { name: "Other", value: 3920, fill: "hsl(var(--chart-5))" },
];

export const mockLatestTransactions: Transaction[] = [
  {
    id: "TRX-1001",
    productId: "P-042",
    productName: "Wireless Mouse",
    productSku: "ELEC-WM-042",
    type: "outgoing",
    quantity: 120,
    status: "completed",
    createdAt: "2026-07-05T08:24:00Z",
    createdBy: "Sarah Chen",
  },
  {
    id: "TRX-1000",
    productId: "P-018",
    productName: "Office Chair",
    productSku: "FURN-OC-018",
    type: "incoming",
    quantity: 60,
    status: "completed",
    createdAt: "2026-07-05T07:10:00Z",
    createdBy: "Mike Johnson",
  },
  {
    id: "TRX-0999",
    productId: "P-077",
    productName: "Cordless Drill",
    productSku: "TOOL-CD-077",
    type: "outgoing",
    quantity: 24,
    status: "pending",
    createdAt: "2026-07-04T16:45:00Z",
    createdBy: "Sarah Chen",
  },
  {
    id: "TRX-0998",
    productId: "P-103",
    productName: "Cardboard Box (L)",
    productSku: "PACK-CB-103",
    type: "incoming",
    quantity: 800,
    status: "completed",
    createdAt: "2026-07-04T11:20:00Z",
    createdBy: "Lisa Park",
  },
  {
    id: "TRX-0997",
    productId: "P-051",
    productName: "USB-C Cable 2m",
    productSku: "ELEC-UC-051",
    type: "outgoing",
    quantity: 200,
    status: "cancelled",
    createdAt: "2026-07-03T14:05:00Z",
    createdBy: "Mike Johnson",
  },
];
