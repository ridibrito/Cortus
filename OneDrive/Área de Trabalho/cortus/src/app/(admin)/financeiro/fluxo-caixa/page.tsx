import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fluxo de Caixa | CORTUS CRM/ERP",
  description: "Gerenciamento financeiro - Fluxo de Caixa",
};

export default function FluxoCaixaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Fluxo de Caixa
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Acompanhe o fluxo de caixa da sua empresa
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Gráfico de fluxo de caixa será implementado aqui
        </p>
      </div>
    </div>
  );
}

