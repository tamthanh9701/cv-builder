'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/lib/i18n-provider';
import { useToast } from '@/components/ui/Toast';
import type { CV, CVAnalysis } from '@/lib/types';

export default function AnalysisPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [cvs, setCvs] = useState<CV[]>([]);
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0=history, 1=select cv, 2=input jd, 3=result
  const [selectedCvId, setSelectedCvId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysis | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: cvData }, { data: analysisData }] = await Promise.all([
      supabase.from('cvs').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('cv_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setCvs((cvData as CV[]) || []);
    setAnalyses((analysisData as CVAnalysis[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAnalyze() {
    if (!selectedCvId || !jobDesc || !user) return;
    setAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const cv = cvs.find(c => c.id === selectedCvId);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ cvData: cv?.data, jobDescription: jobDesc, jobTitle, jobUrl }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const analysisResult = await res.json();

      const { data: saved } = await supabase.from('cv_analyses').insert({
        user_id: user.id, cv_id: selectedCvId, job_title: jobTitle, job_url: jobUrl,
        job_description: jobDesc, analysis_result: analysisResult, overall_score: analysisResult.overallScore,
      }).select().single();

      setResult(saved as CVAnalysis);
      setStep(3);
      fetchData();
    } catch {
      showToast(t('common.error'), 'error');
    }
    setAnalyzing(false);
  }

  function viewResult(analysis: CVAnalysis) {
    setResult(analysis);
    setStep(3);
  }

  function startNew() {
    setStep(1);
    setSelectedCvId('');
    setJobTitle(''); setJobUrl(''); setJobDesc('');
    setResult(null);
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  }

  // Step 3: Results
  if (step === 3 && result) {
    const r = result.analysis_result;
    return (
      <div className="slide-up" style={{ maxWidth: 800, margin: '0 auto' }}>
        <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ marginBottom: 24 }}>← {t('common.back')}</button>
        <h2 style={{ marginBottom: 24 }}>{t('analysis.result')}</h2>

        <div className="analysis-score-circle" style={{ ['--score-deg' as string]: `${(result.overall_score || 0) * 3.6}deg` }}>
          <div className="analysis-score-inner">
            <div className="analysis-score-value">{result.overall_score}</div>
            <div className="analysis-score-label">{t('analysis.score')}</div>
          </div>
        </div>

        {r.categories && (
          <div className="analysis-categories">
            {Object.entries(r.categories).map(([key, val]) => (
              <div key={key} className="analysis-category">
                <div className="analysis-category-score">{val as number}</div>
                <div className="analysis-category-label">{key}</div>
              </div>
            ))}
          </div>
        )}

        {r.strengths?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12, color: 'var(--success-400)' }}>{t('analysis.strengths')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.strengths.map((s: string, i: number) => (
                <div key={i} style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, fontSize: '14px', borderLeft: '3px solid var(--success-400)' }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {r.gaps?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12, color: 'var(--error-400)' }}>{t('analysis.gaps')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.gaps.map((g: string, i: number) => (
                <div key={i} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, fontSize: '14px', borderLeft: '3px solid var(--error-400)' }}>{g}</div>
              ))}
            </div>
          </div>
        )}

        {r.keywords && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>{t('analysis.keywords')}</h3>
            <div style={{ marginBottom: 8 }}><span className="text-sm text-secondary">{t('analysis.found')}:</span></div>
            <div className="analysis-tags" style={{ marginBottom: 12 }}>
              {r.keywords.found?.map((k: string, i: number) => <span key={i} className="analysis-tag-found">{k}</span>)}
            </div>
            <div style={{ marginBottom: 8 }}><span className="text-sm text-secondary">{t('analysis.missing')}:</span></div>
            <div className="analysis-tags">
              {r.keywords.missing?.map((k: string, i: number) => <span key={i} className="analysis-tag-missing">{k}</span>)}
            </div>
          </div>
        )}

        {r.suggestions?.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 12 }}>{t('analysis.suggestions')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.suggestions.map((s: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{s.section}</span>
                    <span className={`badge ${s.priority === 'high' ? 'badge-error' : s.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`}>{s.priority}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.recommended}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1-2: Wizard
  if (step > 0) {
    return (
      <div className="slide-up analysis-wizard">
        <button className="btn btn-ghost" onClick={() => setStep(step - 1)} style={{ marginBottom: 24 }}>← {t('common.back')}</button>

        <div className="analysis-steps">
          {[1,2,3].map(s => (
            <div key={s} className="analysis-step">
              {s > 1 && <div className="analysis-step-line" style={{ background: step >= s ? 'var(--primary-500)' : undefined }} />}
              <div className={`analysis-step-number ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>{s}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3>{t('analysis.selectCv')}</h3>
            {cvs.map(cv => (
              <div key={cv.id}
                className={`glass-card`}
                style={{ padding: 16, cursor: 'pointer', border: selectedCvId === cv.id ? '2px solid var(--primary-500)' : undefined }}
                onClick={() => setSelectedCvId(cv.id)}
              >
                <div style={{ fontWeight: 600 }}>{cv.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{cv.data?.personal?.title || 'No title'}</div>
              </div>
            ))}
            <button className="btn btn-primary btn-lg" disabled={!selectedCvId} onClick={() => setStep(2)} style={{ marginTop: 16 }}>
              {t('common.next')} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3>{t('analysis.jobDesc')}</h3>
            <div className="input-group"><label className="input-label">{t('analysis.jobTitle')}</label><input className="input-field" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
            <div className="input-group"><label className="input-label">{t('analysis.jobUrl')}</label><input className="input-field" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="input-group"><label className="input-label">{t('analysis.jobDesc')} *</label><textarea className="input-field" rows={10} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder={t('analysis.pasteJd')} /></div>
            <button className="btn btn-primary btn-lg" disabled={!jobDesc || analyzing} onClick={handleAnalyze}>
              {analyzing ? <><Loader2 size={18} style={{ animation: 'spin 0.6s linear infinite' }} /> {t('analysis.analyzing')}</> : <>{t('analysis.analyze')} <ArrowRight size={18} /></>}
            </button>
          </div>
        )}
      </div>
    );
  }

  // History view
  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>{t('analysis.title')}</h1>
          <p className="page-header-desc">{t('analysis.history')}</p>
        </div>
        <button className="btn btn-primary" onClick={startNew}>
          <BarChart3 size={18} /> {t('analysis.new')}
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BarChart3 size={40} /></div>
          <h3>{t('analysis.empty')}</h3>
          <p>Analyze your CV against job descriptions to get improvement suggestions.</p>
          <button className="btn btn-primary btn-lg" onClick={startNew}>{t('analysis.new')}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analyses.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => viewResult(a)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.job_title || 'Untitled'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(a.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${(a.overall_score || 0) >= 70 ? 'badge-success' : (a.overall_score || 0) >= 40 ? 'badge-warning' : 'badge-error'}`}>
                    {a.overall_score}/100
                  </span>
                  <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
