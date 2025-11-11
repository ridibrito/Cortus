import { Metadata } from "next";
import { UserCircleIcon, DollarLineIcon, TaskIcon, PieChartIcon } from "@/icons";
import ContatosChart from "@/components/dashboard/ContatosChart";
import RevenueChart from "@/components/dashboard/RevenueChart";

export const metadata: Metadata = {
  title: "Dashboard | CORTUS CRM/ERP",
  description: "Dashboard principal do CORTUS",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Contatos
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Receita Total
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                R$ 0
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
              <DollarLineIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Negócios Abertos
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
              <TaskIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Taxa de Conversão
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                0%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20">
              <PieChartIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Evolução de Contatos
          </h2>
          <ContatosChart />
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Receita Mensal
          </h2>
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}

