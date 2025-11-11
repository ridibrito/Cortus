import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import SelectInputs from "@/components/form/form-elements/SelectInputs";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
import InputStates from "@/components/form/form-elements/InputStates";
import InputGroup from "@/components/form/form-elements/InputGroup";
import FileInputExample from "@/components/form/form-elements/FileInputExample";
import CheckboxComponents from "@/components/form/form-elements/CheckboxComponents";
import RadioButtons from "@/components/form/form-elements/RadioButtons";
import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import DefaultModal from "@/components/example/ModalExample/DefaultModal";
import VerticallyCenteredModal from "@/components/example/ModalExample/VerticallyCenteredModal";
import FormInModal from "@/components/example/ModalExample/FormInModal";
import FullScreenModal from "@/components/example/ModalExample/FullScreenModal";
import ModalBasedAlerts from "@/components/example/ModalExample/ModalBasedAlerts";
import BasicTableOne from "@/components/tables/BasicTableOne";
import ResponsiveImage from "@/components/ui/images/ResponsiveImage";
import TwoColumnImageGrid from "@/components/ui/images/TwoColumnImageGrid";
import ThreeColumnImageGrid from "@/components/ui/images/ThreeColumnImageGrid";
import VideosExample from "@/components/ui/video/VideosExample";
import YouTubeEmbed from "@/components/ui/video/YouTubeEmbed";
import { BoxIcon, PlusIcon } from "@/icons";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Componentes | CORTUS CRM/ERP",
  description: "Todos os componentes disponíveis no template",
};

export default function ComponentsPage() {
  return (
    <div>
      <div className="space-y-6">
        {/* Alerts */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Alertas
          </h2>
          <ComponentCard title="Success Alert">
            <Alert
              variant="success"
              title="Mensagem de Sucesso"
              message="Esta ação foi realizada com sucesso."
              showLink={true}
              linkHref="/"
              linkText="Saiba mais"
            />
            <Alert
              variant="success"
              title="Mensagem de Sucesso"
              message="Esta ação foi realizada com sucesso."
              showLink={false}
            />
          </ComponentCard>
          <ComponentCard title="Warning Alert">
            <Alert
              variant="warning"
              title="Aviso"
              message="Tenha cuidado ao realizar esta ação."
              showLink={true}
              linkHref="/"
              linkText="Saiba mais"
            />
            <Alert
              variant="warning"
              title="Aviso"
              message="Tenha cuidado ao realizar esta ação."
              showLink={false}
            />
          </ComponentCard>
          <ComponentCard title="Error Alert">
            <Alert
              variant="error"
              title="Erro"
              message="Ocorreu um erro ao processar sua solicitação."
              showLink={true}
              linkHref="/"
              linkText="Saiba mais"
            />
            <Alert
              variant="error"
              title="Erro"
              message="Ocorreu um erro ao processar sua solicitação."
              showLink={false}
            />
          </ComponentCard>
          <ComponentCard title="Info Alert">
            <Alert
              variant="info"
              title="Informação"
              message="Esta é uma mensagem informativa."
              showLink={true}
              linkHref="/"
              linkText="Saiba mais"
            />
            <Alert
              variant="info"
              title="Informação"
              message="Esta é uma mensagem informativa."
              showLink={false}
            />
          </ComponentCard>
        </div>

        {/* Buttons */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Botões
          </h2>
          <ComponentCard title="Botão Primário">
            <div className="flex items-center gap-5">
              <Button size="sm" variant="primary">
                Botão Pequeno
              </Button>
              <Button size="md" variant="primary">
                Botão Médio
              </Button>
            </div>
          </ComponentCard>
          <ComponentCard title="Botão Primário com Ícone Esquerdo">
            <div className="flex items-center gap-5">
              <Button size="sm" variant="primary" startIcon={<BoxIcon />}>
                Com Ícone
              </Button>
              <Button size="md" variant="primary" startIcon={<BoxIcon />}>
                Com Ícone
              </Button>
            </div>
          </ComponentCard>
          <ComponentCard title="Botão Primário com Ícone Direito">
            <div className="flex items-center gap-5">
              <Button size="sm" variant="primary" endIcon={<BoxIcon />}>
                Com Ícone
              </Button>
              <Button size="md" variant="primary" endIcon={<BoxIcon />}>
                Com Ícone
              </Button>
            </div>
          </ComponentCard>
          <ComponentCard title="Botão Secundário">
            <div className="flex items-center gap-5">
              <Button size="sm" variant="outline">
                Botão Pequeno
              </Button>
              <Button size="md" variant="outline">
                Botão Médio
              </Button>
            </div>
          </ComponentCard>
        </div>

        {/* Badges */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Badges
          </h2>
          <ComponentCard title="Badges com Fundo Claro">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="light" color="primary">
                Primário
              </Badge>
              <Badge variant="light" color="success">
                Sucesso
              </Badge>
              <Badge variant="light" color="error">
                Erro
              </Badge>
              <Badge variant="light" color="warning">
                Aviso
              </Badge>
              <Badge variant="light" color="info">
                Info
              </Badge>
            </div>
          </ComponentCard>
          <ComponentCard title="Badges com Fundo Sólido">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="solid" color="primary">
                Primário
              </Badge>
              <Badge variant="solid" color="success">
                Sucesso
              </Badge>
              <Badge variant="solid" color="error">
                Erro
              </Badge>
              <Badge variant="solid" color="warning">
                Aviso
              </Badge>
              <Badge variant="solid" color="info">
                Info
              </Badge>
            </div>
          </ComponentCard>
          <ComponentCard title="Badges com Ícone">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="light" color="primary" startIcon={<PlusIcon />}>
                Com Ícone
              </Badge>
              <Badge variant="light" color="success" startIcon={<PlusIcon />}>
                Com Ícone
              </Badge>
              <Badge variant="solid" color="primary" endIcon={<PlusIcon />}>
                Com Ícone
              </Badge>
              <Badge variant="solid" color="success" endIcon={<PlusIcon />}>
                Com Ícone
              </Badge>
            </div>
          </ComponentCard>
        </div>

        {/* Avatars */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Avatares
          </h2>
          <ComponentCard title="Avatares Padrão">
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Avatar src="/images/user/user-01.jpg" size="xsmall" />
              <Avatar src="/images/user/user-01.jpg" size="small" />
              <Avatar src="/images/user/user-01.jpg" size="medium" />
              <Avatar src="/images/user/user-01.jpg" size="large" />
              <Avatar src="/images/user/user-01.jpg" size="xlarge" />
            </div>
          </ComponentCard>
          <ComponentCard title="Avatares com Indicador Online">
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Avatar
                src="/images/user/user-01.jpg"
                size="small"
                status="online"
              />
              <Avatar
                src="/images/user/user-01.jpg"
                size="medium"
                status="online"
              />
              <Avatar
                src="/images/user/user-01.jpg"
                size="large"
                status="online"
              />
            </div>
          </ComponentCard>
          <ComponentCard title="Avatares com Indicador Offline">
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Avatar
                src="/images/user/user-01.jpg"
                size="small"
                status="offline"
              />
              <Avatar
                src="/images/user/user-01.jpg"
                size="medium"
                status="offline"
              />
              <Avatar
                src="/images/user/user-01.jpg"
                size="large"
                status="offline"
              />
            </div>
          </ComponentCard>
        </div>

        {/* Form Elements */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Elementos de Formulário
          </h2>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <DefaultInputs />
              <SelectInputs />
              <TextAreaInput />
              <InputStates />
            </div>
            <div className="space-y-6">
              <InputGroup />
              <FileInputExample />
              <CheckboxComponents />
              <RadioButtons />
              <ToggleSwitch />
              <DropzoneComponent />
            </div>
          </div>
        </div>

        {/* Modals */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Modais
          </h2>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
            <DefaultModal />
            <VerticallyCenteredModal />
            <FormInModal />
            <FullScreenModal />
            <ModalBasedAlerts />
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Tabelas
          </h2>
          <ComponentCard title="Tabela Básica">
            <BasicTableOne />
          </ComponentCard>
        </div>

        {/* Images */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Imagens
          </h2>
          <ComponentCard title="Imagem Responsiva">
            <ResponsiveImage />
          </ComponentCard>
          <ComponentCard title="Grid de 2 Colunas">
            <TwoColumnImageGrid />
          </ComponentCard>
          <ComponentCard title="Grid de 3 Colunas">
            <ThreeColumnImageGrid />
          </ComponentCard>
        </div>

        {/* Videos */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Vídeos
          </h2>
          <ComponentCard title="Exemplos de Vídeos">
            <VideosExample />
          </ComponentCard>
          <ComponentCard title="Embed do YouTube">
            <YouTubeEmbed />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
