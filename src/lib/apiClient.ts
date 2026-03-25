const BASE_URL =
  process.env.VORESDIGITAL_API_BASE_URL ?? "https://api.voresdigital.dk";

const API_KEY = process.env.VORESDIGITAL_API_KEY;

import type { Customer, MonthlyMetrics } from "../types/customer";

type RawMonthlyMetrics = {
  year: number;
  month: number;
  clicks: number;
  impressions: number;
  articleReads: number;
};

type RawCustomer = {
  id?: string | number;
  customerName: string;
  mrr: number;
  monthly?: RawMonthlyMetrics[];
};

type CustomersResponse = {
  page: number;
  pageSize: number;
  totalCustomers: number;
  totalPages: number;
  items: RawCustomer[];
};

export type CustomerPage = {
  customers: Customer[];
  page: number;
  pageSize: number;
  totalCustomers: number;
  totalPages: number;
};

export async function fetchActiveCustomers(
  page: number = 1,
  pageSize: number = 10
): Promise<CustomerPage> {
  if (!API_KEY) {
    console.error(
      "VORESDIGITAL_API_KEY is not set. Please add it to your .env.local file."
    );
    return {
      customers: [],
      page,
      pageSize,
      totalCustomers: 0,
      totalPages: 0,
    };
  }

  const url = `${BASE_URL}/data/customers/active?page=${page}&pageSize=${pageSize}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-ApiKey": API_KEY,
    },
    // Ensure this is always server-side and can be cached/revalidated if needed
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch active customers", res.status, res.statusText);
    return {
      customers: [],
      page,
      pageSize,
      totalCustomers: 0,
      totalPages: 0,
    };
  }

  const contentType = res.headers.get("content-type") ?? "";
  const rawText = await res.text();

  if (!contentType.includes("application/json")) {
    console.error(
      "Expected JSON but received non-JSON response from customers API",
      contentType,
      rawText.slice(0, 200)
    );
    return {
      customers: [],
      page,
      pageSize,
      totalCustomers: 0,
      totalPages: 0,
    };
  }

  let json: CustomersResponse;
  try {
    json = JSON.parse(rawText) as CustomersResponse;
  } catch (error) {
    console.error(
      "Failed to parse JSON from customers API",
      (error as Error).message,
      rawText.slice(0, 200)
    );
    return {
      customers: [],
      page,
      pageSize,
      totalCustomers: 0,
      totalPages: 0,
    };
  }
  const items = json.items ?? [];

  const customers = items.map((raw, index) => {
    const monthly: MonthlyMetrics[] | undefined = raw.monthly?.map((m) => ({
      year: m.year,
      month: m.month,
      clicks: m.clicks,
      impressions: m.impressions,
      articleReads: m.articleReads,
    }));

    return {
      // The API response doesn't appear to include a stable `id`.
      // Use `customerName` as a fallback so pagination doesn't reuse ids (0..9) across pages.
      id: raw.id ?? raw.customerName ?? index,
      name: raw.customerName,
      mrr: Number(raw.mrr ?? 0),
      monthly,
    };
  });

  const computedTotalPages =
    json.pageSize > 0
      ? Math.ceil(json.totalCustomers / json.pageSize)
      : json.totalPages;

  return {
    customers,
    page: json.page,
    pageSize: json.pageSize,
    totalCustomers: json.totalCustomers,
    totalPages: computedTotalPages,
  };
}

