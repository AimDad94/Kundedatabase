import type { CallStatus, Customer, CustomerWithStatus } from "../types/customer";

const HIGH_MRR_THRESHOLD = 20000;
const LOW_MRR_THRESHOLD = 5000;

export function decideCallStatus(customer: Customer): CallStatus {
  const mrr = customer.mrr;

  if (mrr >= HIGH_MRR_THRESHOLD) {
    return "call_good";
  }

  if (mrr <= LOW_MRR_THRESHOLD) {
    return "call_bad";
  }

  return "no_call";
}

export function groupCustomersByCallStatus(
  customers: Customer[]
): {
  needGoodCall: CustomerWithStatus[];
  needBadCall: CustomerWithStatus[];
  noCall: CustomerWithStatus[];
} {
  const needGoodCall: CustomerWithStatus[] = [];
  const needBadCall: CustomerWithStatus[] = [];
  const noCall: CustomerWithStatus[] = [];

  for (const customer of customers) {
    const status = decideCallStatus(customer);
    const withStatus: CustomerWithStatus = { ...customer, status };

    if (status === "call_good") {
      needGoodCall.push(withStatus);
    } else if (status === "call_bad") {
      needBadCall.push(withStatus);
    } else {
      noCall.push(withStatus);
    }
  }

  return { needGoodCall, needBadCall, noCall };
}

