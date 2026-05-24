"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { login as loginRequest } from "@/lib/authApi";

export default function LoginPage() {
  const login = useTranslations("login");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // API_CONNECTION_POINT: this already calls the auth client; replace the local fallback with the real API.
    await loginRequest({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    window.location.href = "/dashboard";
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f4ee] px-5 py-10 text-zinc-950 dark:bg-[#080807] dark:text-zinc-50">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight">{login.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{login.subtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={login.email}><Input name="email" type="email" placeholder={login.emailPlaceholder} /></FieldLabel>
          <FieldLabel label={login.password}><Input name="password" type="password" placeholder="••••••••" /></FieldLabel>
          <Button type="submit">{login.submit}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-zinc-500">
          {login.noAccount} <Link href="/register" className="font-bold text-zinc-950 dark:text-white">{login.createAccount}</Link>
        </p>
      </Card>
    </main>
  );
}
