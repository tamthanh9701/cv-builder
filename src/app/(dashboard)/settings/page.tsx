'use client';

import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/lib/i18n-provider';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  if (user && user.role !== 'admin') redirect('/cvs');

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>{t('nav.settings')}</h1>
          <p className="page-header-desc">Admin settings</p>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Settings size={24} color="var(--primary-400)" />
          <h3>Application Settings</h3>
        </div>
        <p className="text-secondary text-sm">Vertex AI and other settings will be managed here. Coming soon.</p>
      </div>
    </div>
  );
}
