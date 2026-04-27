'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, LayoutTemplate, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/lib/i18n-provider';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import type { CVTemplate } from '@/lib/types';

export default function TemplatesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const isAdmin = user?.role === 'admin';

  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.from('cv_templates').select('*').order('created_at', { ascending: false });
    setTemplates((data as CVTemplate[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  async function handleUpload() {
    if (!name || !file || !user) return;
    setUploading(true);

    const filePath = `templates/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('template-pdfs').upload(filePath, file);
    if (uploadErr) { showToast(t('common.error'), 'error'); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('template-pdfs').getPublicUrl(filePath);

    const { error } = await supabase.from('cv_templates').insert({
      name, description: desc, pdf_url: publicUrl, created_by: user.id,
    });

    if (!error) {
      showToast(t('common.success'));
      setUploadOpen(false);
      setName(''); setDesc(''); setFile(null);
      fetchTemplates();
    } else {
      showToast(t('common.error'), 'error');
    }
    setUploading(false);
  }

  async function toggleActive(tmpl: CVTemplate) {
    await supabase.from('cv_templates').update({ is_active: !tmpl.is_active }).eq('id', tmpl.id);
    fetchTemplates();
  }

  if (loading) {
    return (
      <div>
        <div className="page-header"><div className="skeleton" style={{ width: 200, height: 32 }} /></div>
        <div className="template-grid">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}</div>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>{t('template.gallery')}</h1>
          <p className="page-header-desc">{templates.length} templates</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
            <Upload size={18} /> {t('template.upload')}
          </button>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><LayoutTemplate size={40} /></div>
          <h3>{t('template.empty')}</h3>
          <p>Templates will appear here once uploaded by admin.</p>
        </div>
      ) : (
        <div className="template-grid">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="glass-card template-card">
              <div className="template-card-image">
                {tmpl.thumbnail_url ? (
                  <img src={tmpl.thumbnail_url} alt={tmpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <LayoutTemplate size={48} />
                )}
              </div>
              <div className="template-card-body">
                <div className="template-card-name">{tmpl.name}</div>
                <div className="template-card-desc">{tmpl.description || 'No description'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className={`badge ${tmpl.is_active ? 'badge-success' : 'badge-warning'}`}>
                    {tmpl.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {tmpl.ai_detected && <span className="badge badge-primary">AI</span>}
                </div>
                <div className="template-card-actions">
                  {isAdmin && (
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(tmpl)}>
                      {tmpl.is_active ? <><ToggleRight size={14} /> {t('template.deactivate')}</> : <><ToggleLeft size={14} /> {t('template.activate')}</>}
                    </button>
                  )}
                  {tmpl.is_active && (
                    <button className="btn btn-primary btn-sm">{t('template.apply')}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={t('template.upload')} actions={
        <>
          <button className="btn btn-secondary" onClick={() => setUploadOpen(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !name || !file}>
            {uploading ? <span className="spinner" /> : t('template.upload')}
          </button>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">{t('template.name')}</label><input className="input-field" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="input-group"><label className="input-label">{t('template.description')}</label><textarea className="input-field" value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
          <div className="input-group"><label className="input-label">PDF File</label><input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="input-field" /></div>
        </div>
      </Modal>
    </div>
  );
}
