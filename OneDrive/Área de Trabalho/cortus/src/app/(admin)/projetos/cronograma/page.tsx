import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cronograma | CORTUS CRM/ERP",
  description: "Cronograma de projetos",
};

export default function CronogramaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Cronograma
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualize o cronograma dos seus projetos
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Cronograma será implementado aqui
        </p>
      </div>
    </div>
  );
}

