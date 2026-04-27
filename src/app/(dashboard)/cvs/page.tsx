'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Copy, Trash2, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/lib/i18n-provider';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import type { CV } from '@/lib/types';
import { emptyCVData } from '@/lib/types';

export default function CVsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCVs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setCvs((data as CV[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchCVs(); }, [fetchCVs]);

  async function createCV() {
    if (!user) return;
    const { data, error } = await supabase
      .from('cvs')
      .insert({ user_id: user.id, name: t('cv.untitled'), data: emptyCVData })
      .select()
      .single();
    if (data) router.push(`/cvs/${data.id}`);
    if (error) showToast(t('common.error'), 'error');
  }

  async function cloneCV(cv: CV) {
    if (!user) return;
    const { data, error } = await supabase
      .from('cvs')
      .insert({
        user_id: user.id,
        name: `${cv.name} (Copy)`,
        data: cv.data,
        template_id: cv.template_id,
        cloned_from: cv.id,
      })
      .select()
      .single();
    if (data) {
      showToast(t('cv.cloneSuccess'));
      fetchCVs();
    }
    if (error) showToast(t('common.error'), 'error');
  }

  async function deleteCV() {
    if (!deleteId) return;
    const { error } = await supabase.from('cvs').delete().eq('id', deleteId);
    if (!error) {
      showToast(t('common.success'));
      setCvs(prev => prev.filter(c => c.id !== deleteId));
    } else {
      showToast(t('common.error'), 'error');
    }
    setDeleteId(null);
  }

  async function toggleDefault(cv: CV) {
    if (!user) return;
    // Reset all defaults first
    await supabase.from('cvs').update({ is_default: false }).eq('user_id', user.id);
    // Set new default
    await supabase.from('cvs').update({ is_default: true }).eq('id', cv.id);
    fetchCVs();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div><div className="skeleton" style={{ width: 200, height: 32 }} /></div>
          <div className="skeleton" style={{ width: 140, height: 40, borderRadius: 10 }} />
        </div>
        <div className="cv-grid">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>{t('nav.cvs')}</h1>
          <p className="page-header-desc">{cvs.length} CV</p>
        </div>
        <button className="btn btn-primary" onClick={createCV}>
          <Plus size={18} />
          {t('cv.create')}
        </button>
      </div>

      {cvs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={40} />
          </div>
          <h3>{t('cv.empty')}</h3>
          <p>{t('cv.emptyDesc')}</p>
          <button className="btn btn-primary btn-lg" onClick={createCV}>
            <Plus size={20} />
            {t('cv.create')}
          </button>
        </div>
      ) : (
        <div className="cv-grid">
          {cvs.map(cv => (
            <div
              key={cv.id}
              className="glass-card cv-card"
              onClick={() => router.push(`/cvs/${cv.id}`)}
            >
              {cv.is_default && (
                <div className="cv-card-badge">
                  <span className="badge badge-primary">
                    <Star size={12} style={{ marginRight: 4 }} />
                    Default
                  </span>
                </div>
              )}
              <div className="cv-card-header">
                <div>
                  <div className="cv-card-name">{cv.name}</div>
                  <div className="cv-card-meta">
                    {t('cv.lastUpdated')}: {formatDate(cv.updated_at)}
                  </div>
                </div>
              </div>
              <div className="cv-card-preview">
                {cv.data?.personal?.fullName && (
                  <div>
                    <strong style={{ fontSize: '10px' }}>{cv.data.personal.fullName}</strong>
                    <br />
                    <span>{cv.data.personal.title}</span>
                    <br /><br />
                    <span>{cv.data.about?.substring(0, 150)}...</span>
                  </div>
                )}
              </div>
              <div className="cv-card-actions" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => cloneCV(cv)} title={t('cv.clone')}>
                  <Copy size={14} /> {t('cv.clone')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleDefault(cv)} title={t('cv.setDefault')}>
                  <Star size={14} />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cv.id)} title={t('cv.delete')}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t('cv.delete')}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
            <button className="btn btn-danger" onClick={deleteCV}>{t('common.confirm')}</button>
          </>
        }
      >
        <p>{t('cv.deleteConfirm')}</p>
      </Modal>
    </div>
  );
}
