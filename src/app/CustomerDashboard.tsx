"use client";

import type { CustomerWithStatus } from "../types/customer";
import { useEffect, useState } from "react";

type GroupedCustomers = {
  needGoodCall: CustomerWithStatus[];
  needBadCall: CustomerWithStatus[];
  noCall: CustomerWithStatus[];
};

type LocalStatus = "pending" | "completed" | "snoozed";

type Props = {
  grouped: GroupedCustomers;
  pagination: {
    page: number;
    totalPages: number;
  };
};

export default function CustomerDashboard({ grouped, pagination }: Props) {
  const [localStatus, setLocalStatus] = useState<
    Record<string | number, LocalStatus>
  >({});

  // When the user navigates between pages, the customer list changes.
  // Reset local snooze/completed state so it doesn't hide unrelated customers.
  useEffect(() => {
    setLocalStatus({});
  }, [pagination.page]);

  const markCompleted = (id: string | number | null) => {
    if (id === null) return;
    setLocalStatus((prev) => ({ ...prev, [id]: "completed" as LocalStatus }));
  };

  const snooze = (id: string | number | null) => {
    if (id === null) return;
    setLocalStatus((prev) => ({ ...prev, [id]: "snoozed" as LocalStatus }));
  };

  const isVisible = (id: string | number | null) => {
    if (id === null) return true;
    const status = localStatus[id];
    return status !== "completed" && status !== "snoozed";
  };

  const getLatestMetrics = (customer: CustomerWithStatus) => {
    if (!customer.monthly || customer.monthly.length === 0) return null;

    const latest = customer.monthly.reduce((latestSoFar, current) => {
      if (!latestSoFar) return current;
      if (current.year > latestSoFar.year) return current;
      if (current.year === latestSoFar.year && current.month > latestSoFar.month) {
        return current;
      }
      return latestSoFar;
    });

    return latest;
  };

  const renderSection = (
    title: string,
    customers: CustomerWithStatus[],
    highlight: "good" | "bad" | "neutral"
  ) => {
    const colorClass =
      highlight === "good"
        ? "border-green-400 bg-green-50"
        : highlight === "bad"
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white";

    const visibleCustomers = customers.filter((c) => isVisible(c.id));

    return (
      <section className={`w-full rounded-lg border ${colorClass} p-4`}>
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        {visibleCustomers.length === 0 ? (
          <p className="text-sm text-gray-600">
            Ingen kunder i denne kategori lige nu.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleCustomers.map((customer) => {
              const latest = getLatestMetrics(customer);

              return (
                <div
                  key={customer.id ?? customer.name}
                  className="grid w-full grid-cols-4 items-center gap-4 rounded-md border border-gray-200 bg-white px-4 py-3"
                >
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      MRR: {customer.mrr.toLocaleString("da-DK")} kr.
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-700">
                    <div className="font-semibold">Klik</div>
                    <div>
                      {latest
                        ? latest.clicks.toLocaleString("da-DK")
                        : "-"}
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-700">
                    <div className="font-semibold">Visninger</div>
                    <div>
                      {latest
                        ? latest.impressions.toLocaleString("da-DK")
                        : "-"}
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-700">
                    <div className="font-semibold">Artikellæsninger</div>
                    <div>
                      {latest
                        ? latest.articleReads.toLocaleString("da-DK")
                        : "-"}
                    </div>
                  </div>

                  <div className="col-span-4 mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => markCompleted(customer.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Marker som ringet
                    </button>
                    <button
                      type="button"
                      onClick={() => snooze(customer.id)}
                      className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300"
                    >
                      Udsæt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Kunde check-in overblik</h1>
        <p className="text-sm text-gray-700">
          Denne side hjælper dig med at se, hvilke kunder der bør ringes op nu – både dem
          der performer rigtig godt, og dem der har brug for ekstra hjælp.
        </p>
      </header>

      <section className="flex items-center justify-between text-sm text-gray-700">
        <div>
          Side {pagination.page} af {pagination.totalPages || 1}
        </div>
        <div className="flex gap-2">
          {(() => {
            const prevPage = Math.max(1, pagination.page - 1);
            const nextPage = pagination.page + 1;
            const canPrev = pagination.page > 1;
            const canNext =
              !!pagination.totalPages && pagination.page < pagination.totalPages;

            return (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!canPrev) return;
                    window.location.href = `/?page=${prevPage}`;
                  }}
                  className={`rounded border px-3 py-1 ${
                    !canPrev
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-disabled={!canPrev}
                >
                  Forrige
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canNext) return;
                    window.location.href = `/?page=${nextPage}`;
                  }}
                  className={`rounded border px-3 py-1 ${
                    !canNext
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-disabled={!canNext}
                >
                  Næste
                </button>
              </>
            );
          })()}
        </div>
      </section>

      <div className="space-y-4">
        {renderSection(
          "Skal ringes – god performance",
          grouped.needGoodCall,
          "good"
        )}
        {renderSection(
          "Skal ringes – lav performance",
          grouped.needBadCall,
          "bad"
        )}
      </div>

      <div className="space-y-4">
        {renderSection(
          "Behøver ikke opkald lige nu",
          grouped.noCall,
          "neutral"
        )}
      </div>
    </main>
  );
}

