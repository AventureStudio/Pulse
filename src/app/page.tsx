"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect using client-side navigation to prevent execution context destruction
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <span className="text-sm text-gray-500">Redirection...</span>
      </div>
    </div>
  );
}