import { fetchActiveCustomers } from "@/lib/apiClient";
import { groupCustomersByCallStatus } from "@/lib/callLogic";
import CustomerDashboard from "@/app/CustomerDashboard";

export const dynamic = "force-dynamic";

type HomeProps = {
  // In Next.js (App Router) with some configs/Turbopack modes,
  // `searchParams` can be a Promise.
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;

  const rawPage = sp?.page;
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = pageStr ? Number(pageStr) || 1 : 1;
  const { customers, totalPages } = await fetchActiveCustomers(page, 10);

  const grouped = groupCustomersByCallStatus(customers);

  const Dashboard = CustomerDashboard as any;

  return (
    <Dashboard
      grouped={grouped}
      pagination={{ page, totalPages }}
    />
  );
}

