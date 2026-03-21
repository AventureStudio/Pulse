import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  redirect("/login");
}