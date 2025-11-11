import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastrar | CORTUS CRM/ERP",
  description: "Página de cadastro do CORTUS CRM/ERP",
};

export default function SignUp() {
  return <SignUpForm />;
}
