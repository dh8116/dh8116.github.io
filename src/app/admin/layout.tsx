import type { Metadata } from "next";
import AdminGate from "@/components/admin/AdminGate";

// The pages under here are published like everything else — a static export
// has no way to hide a route — so they are told not to be indexed, and
// robots.txt says the same. What actually protects them is AdminGate: nothing
// below it renders without a GitHub token that can push to this repo.
export const metadata: Metadata = {
  title: "Admin",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminGate>{children}</AdminGate>;
}
