"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import {
  UserCircleIcon,
  LockIcon,
  PlugInIcon,
  BoxIcon,
  GroupIcon,
  BellIcon,
  GridIcon,
  MailIcon,
} from "@/icons";

type TabId = 
  | "organizacao"
  | "usuarios"
  | "permissoes"
  | "integracoes"
  | "branding"
  | "notificacoes"
  | "seguranca"
  | "geral";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "organizacao", label: "Organização", icon: <GroupIcon /> },
  { id: "usuarios", label: "Usuários", icon: <UserCircleIcon /> },
  { id: "permissoes", label: "Permissões", icon: <LockIcon /> },
  { id: "integracoes", label: "Integrações", icon: <PlugInIcon /> },
  { id: "branding", label: "Branding", icon: <BoxIcon /> },
  { id: "notificacoes", label: "Notificações", icon: <BellIcon /> },
  { id: "seguranca", label: "Segurança", icon: <LockIcon /> },
  { id: "geral", label: "Geral", icon: <GridIcon /> },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("organizacao");

  const renderTabContent = () => {
    switch (activeTab) {
      case "organizacao":
        return (
          <div className="space-y-6">
            <ComponentCard title="Informações da Organização">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Organização
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Digite o nome da organização"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domínio
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="exemplo.com.br"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plano
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>Free</option>
                    <option>Pro</option>
                    <option>Enterprise</option>
                  </select>
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "usuarios":
        return (
          <div className="space-y-6">
            <ComponentCard title="Gerenciamento de Usuários">
              <p className="text-gray-500 dark:text-gray-400">
                Lista de usuários será implementada aqui
              </p>
            </ComponentCard>
            <ComponentCard title="Convidar Novo Usuário">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Papel
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>Admin</option>
                    <option>Comercial</option>
                    <option>Financeiro</option>
                    <option>Operacional</option>
                  </select>
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "permissoes":
        return (
          <div className="space-y-6">
            <ComponentCard title="Papéis e Permissões">
              <p className="text-gray-500 dark:text-gray-400">
                Gerenciador de permissões será implementado aqui
              </p>
            </ComponentCard>
            <ComponentCard title="Criar Novo Papel">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Papel
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Ex: Gerente de Vendas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descreva as responsabilidades deste papel"
                  />
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "integracoes":
        return (
          <div className="space-y-6">
            <ComponentCard title="Integrações Disponíveis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    WhatsApp Business API
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Conecte sua conta do WhatsApp Business
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Google Calendar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Sincronize eventos com Google Calendar
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Asaas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Integração com gateway de pagamento Asaas
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Clicksign
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Assinatura digital de contratos
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Inter
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Integração bancária com Banco Inter
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Gemini AI
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    IA para análise de leads e automações
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Conectar
                  </button>
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "branding":
        return (
          <div className="space-y-6">
            <ComponentCard title="Logo da Organização">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center dark:border-gray-700">
                    <BoxIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                      Upload Logo
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG até 2MB
                    </p>
                  </div>
                </div>
              </div>
            </ComponentCard>
            <ComponentCard title="Cores Personalizadas">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                      defaultValue="#3B82F6"
                    />
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      defaultValue="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                      defaultValue="#10B981"
                    />
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      defaultValue="#10B981"
                    />
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "notificacoes":
        return (
          <div className="space-y-6">
            <ComponentCard title="Preferências de Notificação">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Notificações por Email
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receba notificações importantes por email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Notificações Push
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Notificações de Novos Leads
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Seja notificado quando um novo lead for criado
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </ComponentCard>
          </div>
        );

      case "seguranca":
        return (
          <div className="space-y-6">
            <ComponentCard title="Autenticação de Dois Fatores">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      2FA Ativado
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </ComponentCard>
            <ComponentCard title="Sessões Ativas">
              <p className="text-gray-500 dark:text-gray-400">
                Lista de sessões ativas será implementada aqui
              </p>
            </ComponentCard>
            <ComponentCard title="Histórico de Acesso">
              <p className="text-gray-500 dark:text-gray-400">
                Histórico de acessos será implementado aqui
              </p>
            </ComponentCard>
          </div>
        );

      case "geral":
        return (
          <div className="space-y-6">
            <ComponentCard title="Idioma e Região">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>Português (Brasil)</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fuso Horário
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>America/Sao_Paulo (GMT-3)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>Europe/London (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato de Data
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </ComponentCard>
            <ComponentCard title="Backup e Exportação">
              <div className="space-y-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Exportar Dados
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Exporte todos os dados da organização em formato JSON
                </p>
              </div>
            </ComponentCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }
                `}
              >
                <span className="w-5 h-5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}

