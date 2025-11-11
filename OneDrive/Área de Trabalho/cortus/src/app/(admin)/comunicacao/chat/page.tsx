import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | CORTUS CRM/ERP",
  description: "Chat interno",
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chat interno da equipe
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Chat será implementado aqui
        </p>
      </div>
    </div>
  );
}

