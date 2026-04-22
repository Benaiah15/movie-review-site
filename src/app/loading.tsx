import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {/* Changed border-t-blue-600 to border-t-red-600 */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 dark:border-zinc-800 border-gray-200 border-t-red-600"></div>
    </div>
  );
}