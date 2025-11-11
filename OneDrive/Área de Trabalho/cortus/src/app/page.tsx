import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "CORTUS CRM/ERP | Gestão Completa para seu Negócio",
  description: "Sistema completo de CRM e ERP para gerenciar leads, negócios, finanças e projetos",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se autenticado, redireciona para o dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Landing page será implementada aqui no futuro
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          CORTUS CRM/ERP
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Landing page será implementada aqui
        </p>
        <a
          href="/signin"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Entrar
        </a>
      </div>
    </div>
  );
}

