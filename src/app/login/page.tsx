"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { BrandMark } from "@/components/app/BrandMark";
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
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold tracking-normal">{login.title}</h1>
        <p className="mt-2 text-sm text-[#8B847B]">{login.subtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={login.email}><Input name="email" type="email" placeholder={login.emailPlaceholder} /></FieldLabel>
          <FieldLabel label={login.password}><Input name="password" type="password" placeholder="••••••••" /></FieldLabel>
          <Button type="submit">{login.submit}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-[#8B847B]">
          {login.noAccount} <Link href="/register" className="font-bold text-[#D8B08C]">{login.createAccount}</Link>
        </p>
      </Card>
    </main>
  );
}
