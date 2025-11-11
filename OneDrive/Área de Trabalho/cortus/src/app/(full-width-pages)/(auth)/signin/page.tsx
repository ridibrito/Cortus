import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | CORTUS CRM/ERP",
  description: "Página de login do CORTUS CRM/ERP",
};

export default function SignIn() {
  return <SignInForm />;
}
