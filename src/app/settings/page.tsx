"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/app/AuthProvider";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { PlanSettingsCard } from "@/components/app/PlanSettingsCard";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, PasswordInput } from "@/components/ui/Form";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { requestFirstAccessTour } from "@/lib/firstAccessTour";
import { apiToAppLanguage, appToApiLanguage } from "@/lib/api-contracts";
import { authApi } from "@/lib/authApi";

export default function SettingsPage() {
  const settings = useTranslations("settings");
  const authLabels = useTranslations("authFlow");
  const { user, setUser, logout, deleteAccount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteKeyword, setDeleteKeyword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

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
      setError(getAuthErrorMessage(cause, authLabels));
    } finally { setLoading(false); }
  }

  async function onChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword"));
    const newPassword = String(data.get("newPassword"));
    setSecurityError(""); setSecurityMessage("");
    if (newPassword !== String(data.get("confirmPassword"))) {
      setSecurityError(settings.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSecurityMessage(settings.passwordChanged);
      form.reset();
      window.setTimeout(() => void logout().finally(() => router.replace("/login?passwordReset=1")), 1_200);
    } catch (cause) {
      setSecurityError(getAuthErrorMessage(cause, authLabels));
      setLoading(false);
    }
  }

  async function onLogout() {
    setLoading(true);
    await logout();
    router.replace("/login");
  }

  async function onDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deleteKeyword !== settings.deleteKeyword || !deletePassword) return;
    setLoading(true); setError("");
    try {
      await deleteAccount(deletePassword);
      router.replace("/login");
    } catch (cause) {
      setError(getAuthErrorMessage(cause, authLabels));
      setLoading(false);
    }
  }

  return (
    <AppShell title={settings.title} infoPage="settings">
      <Card data-tour="settings-personal">
        <form onSubmit={onSubmit} className="grid gap-4">
          <h2 className="text-lg font-bold">{settings.personalDetails}</h2>
          <FieldLabel label={settings.name}>
            <Input name="displayName" autoComplete="name" defaultValue={user?.display_name ?? ""} minLength={2} maxLength={100} required />
          </FieldLabel>
          <FieldLabel label={settings.language}><LanguageSelect /></FieldLabel>
          <Button type="submit" disabled={loading}>{settings.saveChanges}</Button>
          {saved ? <p role="status" className="text-sm font-semibold text-emerald-500">{settings.saved}</p> : null}
          {error && !deleteOpen ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
        </form>
      </Card>

      <PlanSettingsCard />

      <Card data-tour="settings-preferences" className="grid gap-4">
        <h2 className="text-lg font-bold">{settings.preferences}</h2>
        <ThemeToggle title={settings.appearance} description={settings.appearanceDescription} lightLabel={settings.lightMode} darkLabel={settings.darkMode} />
        <div className="grid gap-3 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">{settings.tutorial}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{settings.tutorialDescription}</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => user && requestFirstAccessTour(user.id)} disabled={!user}>{settings.replayTutorial}</Button>
        </div>
      </Card>

      <Card data-tour="settings-security">
        {user?.has_password ? <form onSubmit={onChangePassword} className="grid gap-4">
          <h2 className="text-lg font-bold">{settings.security}</h2>
          <FieldLabel label={settings.currentPassword}><PasswordInput name="currentPassword" autoComplete="current-password" minLength={8} maxLength={72} showLabel={authLabels.showPassword} hideLabel={authLabels.hidePassword} required /></FieldLabel>
          <FieldLabel label={settings.newPassword}><PasswordInput name="newPassword" autoComplete="new-password" minLength={8} maxLength={72} showLabel={authLabels.showPassword} hideLabel={authLabels.hidePassword} required /></FieldLabel>
          <FieldLabel label={settings.confirmNewPassword}><PasswordInput name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={72} showLabel={authLabels.showPassword} hideLabel={authLabels.hidePassword} required /></FieldLabel>
          {securityMessage ? <p role="status" className="text-sm font-semibold text-emerald-500">{securityMessage}</p> : null}
          {securityError ? <p role="alert" className="text-sm font-semibold text-red-500">{securityError}</p> : null}
          <Button type="submit" variant="secondary" disabled={loading}>{settings.changePassword}</Button>
        </form> : <div className="grid gap-4">
          <h2 className="text-lg font-bold">{settings.security}</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{settings.googleAccountSecurity}</p>
          <Button href="/forgot-password" variant="secondary">{settings.createPassword}</Button>
        </div>}
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-lg font-bold">{settings.account}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
        <Button variant="secondary" onClick={onLogout} disabled={loading}>{settings.logout}</Button>
        <div className="mt-2 rounded-2xl border border-red-500/25 bg-red-500/5 p-4">
          <h3 className="font-bold text-red-500">{settings.dangerZone}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{settings.deleteExplanation}</p>
          <Button className="mt-4" variant="danger" onClick={() => { setDeleteOpen(true); setError(""); }} disabled={loading || !user?.has_password}>{settings.deleteAccount}</Button>
          {!user?.has_password ? <p className="mt-2 text-xs text-[var(--text-tertiary)]">{settings.passwordRequiredForDeletion}</p> : null}
        </div>
      </Card>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <Card className="alfredModalSurface w-full max-w-md">
            <form onSubmit={onDeleteAccount} className="grid gap-4">
              <h2 id="delete-account-title" className="text-xl font-bold text-red-500">{settings.deleteAccount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{settings.deleteInstruction}</p>
              <FieldLabel label={settings.deleteKeyword}><Input value={deleteKeyword} onChange={(event) => setDeleteKeyword(event.target.value)} autoFocus required /></FieldLabel>
              <FieldLabel label={settings.currentPassword}><PasswordInput value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" minLength={8} maxLength={72} showLabel={authLabels.showPassword} hideLabel={authLabels.hidePassword} required /></FieldLabel>
              {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="secondary" onClick={() => { setDeleteOpen(false); setDeleteKeyword(""); setDeletePassword(""); }}>{settings.cancel}</Button>
                <Button type="submit" variant="danger" disabled={loading || deleteKeyword !== settings.deleteKeyword || !deletePassword}>{settings.confirmDelete}</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
