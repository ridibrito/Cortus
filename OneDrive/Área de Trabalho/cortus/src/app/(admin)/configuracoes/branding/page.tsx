import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branding | CORTUS CRM/ERP",
  description: "Configurações de branding",
};

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Branding
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalize a identidade visual da sua organização
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Configurações de branding serão implementadas aqui
        </p>
      </div>
    </div>
  );
}

