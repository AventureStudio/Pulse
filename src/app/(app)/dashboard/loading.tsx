export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-6 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-full" />
      </div>

      {/* Two column grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent objectives */}
        <div className="card p-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-2 bg-gray-200 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Level breakdown */}
        <div className="card p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-6" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-8" />
                </div>
                <div className="h-2 bg-gray-200 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}