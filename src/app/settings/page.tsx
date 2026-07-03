"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/app/AuthProvider";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { apiToAppLanguage, appToApiLanguage } from "@/lib/api-contracts";
import { authApi } from "@/lib/authApi";

export default function SettingsPage() {
  const settings = useTranslations("settings");
  const { user, setUser, logout, deleteAccount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true); setSaved(false); setError("");
    try {
      const updated = await authApi.updateMe({
        display_name: String(formData.get("displayName")),
        language: appToApiLanguage[language],
      });
      setUser(updated);
      if (updated.language) setLanguage(apiToAppLanguage[updated.language]);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.detail : "Não foi possível salvar as alterações.");
    } finally { setLoading(false); }
  }

  async function onLogout() {
    setLoading(true);
    await logout();
    router.replace("/login");
  }

  async function onDeleteAccount() {
    if (!window.confirm(settings.deleteConfirm)) return;
    setLoading(true); setError("");
    try {
      await deleteAccount();
      router.replace("/login");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.detail : "Não foi possível excluir a conta.");
      setLoading(false);
    }
  }

  return (
    <AppShell title={settings.title}>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4">
          <h2 className="text-lg font-bold">{settings.personalDetails}</h2>
          <FieldLabel label={settings.name}>
            <Input name="displayName" defaultValue={user?.display_name ?? ""} minLength={2} maxLength={100} required />
          </FieldLabel>
          <FieldLabel label={settings.language}><LanguageSelect /></FieldLabel>
          <Button type="submit" disabled={loading}>{settings.saveChanges}</Button>
          {saved ? <p className="text-sm font-semibold text-emerald-500">{settings.saved}</p> : null}
          {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
        </form>
      </Card>
      <Card className="grid gap-4">
        <h2 className="text-lg font-bold">{settings.preferences}</h2>
        <ThemeToggle title={settings.appearance} description={settings.appearanceDescription} lightLabel={settings.lightMode} darkLabel={settings.darkMode} />
      </Card>
      <Card className="grid gap-3">
        <h2 className="text-lg font-bold">{settings.account}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
        <Button variant="secondary" onClick={onLogout} disabled={loading}>{settings.logout}</Button>
        <Button variant="danger" onClick={onDeleteAccount} disabled={loading}>{settings.deleteAccount}</Button>
      </Card>
    </AppShell>
  );
}
