"use client";

import Link from "next/link";

export function Unauthorized() {
  return (
    <div className="container mx-auto p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-800">
          Unauthorized Access
        </h1>
        <p className="text-red-700 mb-4">
          You do not have admin privileges to access this page.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
