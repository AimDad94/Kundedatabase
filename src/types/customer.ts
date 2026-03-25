export type MonthlyMetrics = {
  year: number;
  month: number;
  clicks: number;
  impressions: number;
  articleReads: number;
};

export type Customer = {
  id: string | number | null;
  name: string;
  /** Monthly Recurring Revenue from the API (in DKK or your base currency). */
  mrr: number;
  /** Monthly performance metrics from the API (can be empty). */
  monthly?: MonthlyMetrics[];
};

export type CallStatus = "call_good" | "call_bad" | "no_call";

export type CustomerWithStatus = Customer & {
  status: CallStatus;
};

