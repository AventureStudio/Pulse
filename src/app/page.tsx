import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}

export const metadata = {
  title: "Pulse — OKR Tracking",
  description: "Plateforme de suivi des Objectifs et Résultats Clés"
};