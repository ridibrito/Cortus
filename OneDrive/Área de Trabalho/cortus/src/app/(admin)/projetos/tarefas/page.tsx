import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarefas | CORTUS CRM/ERP",
  description: "Gerenciamento de tarefas",
};

export default function TarefasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Tarefas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie tarefas e atividades dos projetos
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Lista de tarefas será implementada aqui
        </p>
      </div>
    </div>
  );
}

