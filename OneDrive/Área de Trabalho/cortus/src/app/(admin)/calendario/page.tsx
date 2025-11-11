import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendário | CORTUS CRM/ERP",
  description: "Calendário de eventos",
};

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Calendário
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie seus eventos e compromissos
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Calendário será implementado aqui
        </p>
      </div>
    </div>
  );
}

