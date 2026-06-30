"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { useAppData } from "@/components/app/useAppData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea, TimeSelect } from "@/components/ui/Form";
import { deleteAccount, logout, updateProfile } from "@/lib/profileApi";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const settings = useTranslations("settings");
  const { user } = useAppData();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // API_CONNECTION_POINT: this calls the profile client; keep sensitive persistence on the backend only.
    await updateProfile({
      name: String(formData.get("name") ?? ""),
      nickname: String(formData.get("nickname") ?? ""),
      occupation: String(formData.get("occupation") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      wakeTime: String(formData.get("wakeTime") ?? ""),
      sleepTime: String(formData.get("sleepTime") ?? ""),
    });

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  async function onLogout() {
    await logout();
    window.location.href = "/login";
  }

  async function onDeleteAccount() {
    if (!window.confirm(settings.deleteConfirm)) return;
    await deleteAccount();
  }

  return (
    <AppShell title={settings.title}>
      <Card>
        <SectionTitle title={settings.profileOverview} description={settings.profileOverviewDescription} />
        <div className="mt-4 flex flex-wrap gap-2">
          {user.goals.map((goal) => <Badge key={goal} tone="green">{goal}</Badge>)}
        </div>
      </Card>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4">
          <h2 className="text-lg font-bold">{settings.personalDetails}</h2>
          <FieldLabel label={settings.name}><Input name="name" defaultValue={user.name} /></FieldLabel>
          <FieldLabel label={settings.nickname}><Input name="nickname" defaultValue={user.name} placeholder={settings.nicknamePlaceholder} /></FieldLabel>
          <FieldLabel label={settings.occupation}><Input name="occupation" defaultValue={user.occupation} /></FieldLabel>
          <FieldLabel label={settings.bio}><Textarea name="bio" placeholder={settings.bioPlaceholder} /></FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={settings.wakeTime}><TimeSelect name="wakeTime" defaultValue={user.wakeTime} /></FieldLabel>
            <FieldLabel label={settings.sleepTime}><TimeSelect name="sleepTime" defaultValue={user.sleepTime} /></FieldLabel>
          </div>
          <Button type="submit">{settings.saveChanges}</Button>
          {saved ? <p className="text-sm font-semibold text-[var(--text-primary)]">{settings.saved}</p> : null}
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{settings.privacyNote}</p>
        </form>
      </Card>
      <Card className="grid gap-4">
        <h2 className="text-lg font-bold">{settings.preferences}</h2>
        <ThemeToggle
          title={settings.appearance}
          description={settings.appearanceDescription}
          lightLabel={settings.lightMode}
          darkLabel={settings.darkMode}
        />
        <FieldLabel label={settings.language}><LanguageSelect /></FieldLabel>
      </Card>
      <Card className="grid gap-3">
        <h2 className="text-lg font-bold">{settings.account}</h2>
        <Button variant="secondary" onClick={onLogout}>{settings.logout}</Button>
        <Button variant="danger" onClick={onDeleteAccount}>{settings.deleteAccount}</Button>
      </Card>
    </AppShell>
  );
}
