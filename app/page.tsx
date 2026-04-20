// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Mal o utilizador acede a "/", ele é enviado para o dashboard
  redirect("/dashboard");

  // O return null é necessário para o TypeScript,
  // embora o redirect aconteça antes.
  return null;
}
