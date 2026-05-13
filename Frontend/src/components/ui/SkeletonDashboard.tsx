const Shimmer = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-white/[0.06] ${className}`} />
);

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <Shimmer className="w-10 h-10 rounded-xl" />
      </div>
      <Shimmer className="h-7 w-24 mb-2" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

export function ReservationTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            {['id', 'client', 'court', 'time', 'value', 'status'].map((h) => (
              <th key={h} className="px-4 py-3">
                <Shimmer className="h-2.5 w-12" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3.5"><Shimmer className="h-3 w-12" /></td>
              <td className="px-4 py-3.5"><Shimmer className="h-3 w-28" /></td>
              <td className="px-4 py-3.5"><Shimmer className="h-3 w-24" /></td>
              <td className="px-4 py-3.5"><Shimmer className="h-3 w-20" /></td>
              <td className="px-4 py-3.5"><Shimmer className="h-3 w-16" /></td>
              <td className="px-4 py-3.5"><Shimmer className="h-5 w-20 rounded-full" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScheduleSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Shimmer className="h-3 w-16 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-3 w-32" />
            <Shimmer className="h-2.5 w-20" />
          </div>
          <Shimmer className="h-5 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function TopCourtsSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shimmer className="w-4 h-4 rounded" />
        <Shimmer className="h-3 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <Shimmer className="h-2.5 w-24" />
              <Shimmer className="h-2.5 w-16" />
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-200 dark:bg-white/[0.1] rounded-full animate-pulse"
                style={{ width: `${75 - i * 14}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TodaySummarySkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
      <Shimmer className="h-3 w-28 mb-5" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="w-8 h-8 rounded-xl shrink-0" />
            <Shimmer className="h-2.5 flex-1" />
            <Shimmer className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 flex items-center gap-4">
          <Shimmer className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="h-7 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 min-h-[400px] flex flex-col justify-center items-center gap-4">
      <Shimmer className="w-16 h-16 rounded-full" />
      <Shimmer className="h-4 w-40" />
      <Shimmer className="h-2.5 w-32" />
    </div>
  );
}
