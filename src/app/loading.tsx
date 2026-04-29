import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-zinc-800 border-t-red-600 dark:border-t-red-600"></div>
    </div>
  );
}