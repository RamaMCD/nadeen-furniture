"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mockDashboardStats,
  mockLatestTransactions,
  mockMonthlyFlow,
  mockStockByCategory,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Products",
    value: mockDashboardStats.totalProducts,
    icon: Package,
    accent: "text-primary bg-primary/10",
    hint: "across all categories",
  },
  {
    label: "Total Stock",
    value: mockDashboardStats.totalStock,
    icon: Boxes,
    accent: "text-success bg-success/10",
    hint: "units in warehouse",
  },
  {
    label: "Incoming This Month",
    value: mockDashboardStats.incomingThisMonth,
    icon: ArrowDownToLine,
    accent: "text-chart-2 bg-chart-2/10",
    hint: "+12% vs last month",
    trend: "up" as const,
  },
  {
    label: "Outgoing This Month",
    value: mockDashboardStats.outgoingThisMonth,
    icon: ArrowUpFromLine,
    accent: "text-chart-3 bg-chart-3/10",
    hint: "-4% vs last month",
    trend: "down" as const,
  },
];

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  completed: "success",
  pending: "warning",
  cancelled: "destructive",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of warehouse activity and inventory health
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="transition-shadow hover:shadow-soft-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{formatNumber(s.value)}</p>
                  </div>
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", s.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {s.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-success" />}
                  {s.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                  <span>{s.hint}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Goods Flow</CardTitle>
            <CardDescription>Incoming vs outgoing over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyFlow} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incoming"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#gIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outgoing"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    fill="url(#gOut)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
            <CardDescription>Distribution of current inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockStockByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {mockStockByCategory.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {mockStockByCategory.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                  {c.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Latest Transactions</CardTitle>
            <CardDescription>Most recent inventory movements</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/history">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Transaction</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Qty</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockLatestTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs">{t.id}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{t.productName}</div>
                      <div className="text-xs text-muted-foreground">{t.productSku}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          t.type === "incoming" ? "text-success" : "text-chart-3"
                        )}
                      >
                        {t.type === "incoming" ? (
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpFromLine className="h-3.5 w-3.5" />
                        )}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium">{formatNumber(t.quantity)}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={statusVariant[t.status]} className="capitalize">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
