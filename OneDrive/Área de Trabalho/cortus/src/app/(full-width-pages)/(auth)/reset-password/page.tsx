"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao enviar email de recuperação");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError("Erro ao processar solicitação. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Voltar para o login
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Recuperar Senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite seu e-mail para receber um link de recuperação
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                <p className="font-medium mb-2">Email enviado com sucesso!</p>
                <p>
                  Verifique sua caixa de entrada e siga as instruções para
                  redefinir sua senha.
                </p>
              </div>
              <Button
                onClick={() => router.push("/signin")}
                className="w-full"
                size="sm"
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div>
                  <Label>
                    E-mail <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="seu@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Lembrou sua senha?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

