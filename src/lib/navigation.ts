import { LayoutDashboard, Package, Tags, ArrowDownToLine, ArrowUpFromLine, History, UserCircle, ScanSearch, ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard",          href: "/dashboard",             icon: LayoutDashboard },
  { label: "Products",           href: "/dashboard/products",    icon: Package },
  { label: "Categories",         href: "/dashboard/categories",  icon: Tags },
  { label: "Homepage Images",    href: "/dashboard/homepage",    icon: ImageIcon },
  { label: "Incoming Goods",     href: "/dashboard/incoming",    icon: ArrowDownToLine },
  { label: "Outgoing Goods",     href: "/dashboard/outgoing",    icon: ArrowUpFromLine },
  { label: "Transaction History",href: "/dashboard/history",     icon: History },
  { label: "Product Lookup",     href: "/dashboard/lookup",      icon: ScanSearch },
  { label: "Profile",            href: "/dashboard/profile",     icon: UserCircle },
];
