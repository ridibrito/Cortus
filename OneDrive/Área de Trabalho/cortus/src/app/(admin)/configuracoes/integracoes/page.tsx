import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrações | CORTUS CRM/ERP",
  description: "Gerenciamento de integrações",
};

export default function IntegracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Integrações
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure integrações com serviços externos
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Lista de integrações será implementada aqui
        </p>
      </div>
    </div>
  );
}

