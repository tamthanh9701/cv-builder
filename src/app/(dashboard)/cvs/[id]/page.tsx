'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n-provider';
import { useToast } from '@/components/ui/Toast';
import type { CV, CVData, Education, Experience, Skill, Language, Project, Certificate } from '@/lib/types';
import { emptyCVData, generateId } from '@/lib/types';

const SECTIONS = ['personal','about','education','experience','skills','languages','projects','certificates'] as const;
type Section = typeof SECTIONS[number];

export default function CVEditorPage() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const cvId = params.id as string;
  const supabase = createClient();

  const [cv, setCv] = useState<CV | null>(null);
  const [data, setData] = useState<CVData>(emptyCVData);
  const [cvName, setCvName] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [saveStatus, setSaveStatus] = useState<'saved'|'saving'|'idle'>('idle');
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<NodeJS.Timeout>(undefined);

  // Fetch CV
  useEffect(() => {
    (async () => {
      const { data: cvRow } = await supabase.from('cvs').select('*').eq('id', cvId).single();
      if (cvRow) {
        setCv(cvRow as CV);
        setData({ ...emptyCVData, ...(cvRow.data as CVData) });
        setCvName(cvRow.name);
      }
      setLoading(false);
    })();
  }, [cvId, supabase]);

  // Auto-save
  const saveData = useCallback(async (newData: CVData, name?: string) => {
    setSaveStatus('saving');
    const updates: Record<string, unknown> = { data: newData };
    if (name !== undefined) updates.name = name;
    await supabase.from('cvs').update(updates).eq('id', cvId);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [cvId, supabase]);

  function updateData(newData: CVData) {
    setData(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(newData, cvName), 2000);
  }

  function updateName(name: string) {
    setCvName(name);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(data, name), 2000);
  }

  // Section update helpers
  function updatePersonal(field: string, value: string) {
    updateData({ ...data, personal: { ...data.personal, [field]: value } });
  }

  function addItem(key: keyof CVData, template: Record<string, unknown>) {
    const arr = (data[key] as any[]) || [];
    updateData({ ...data, [key]: [...arr, { ...template, id: generateId() }] } as any);
  }

  function updateItem(key: keyof CVData, id: string, updates: Record<string, unknown>) {
    const arr = ((data[key] as any[]) || []).map((item: any) => item.id === id ? { ...item, ...updates } : item);
    updateData({ ...data, [key]: arr } as any);
  }

  function removeItem(key: keyof CVData, id: string) {
    const arr = ((data[key] as any[]) || []).filter((item: any) => item.id !== id);
    updateData({ ...data, [key]: arr } as any);
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;
  }

  const sectionKeys: Record<Section, string> = {
    personal: 'cv.section.personal', about: 'cv.section.about', education: 'cv.section.education',
    experience: 'cv.section.experience', skills: 'cv.section.skills', languages: 'cv.section.languages',
    projects: 'cv.section.projects', certificates: 'cv.section.certificates',
  };

  return (
    <div className="slide-up">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/cvs')}><ArrowLeft size={18} /></button>
        <input
          className="input-field"
          value={cvName}
          onChange={e => updateName(e.target.value)}
          style={{ flex: 1, maxWidth: 300, fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)', borderRadius: 0, padding: '4px 0' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {saveStatus === 'saving' && <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> {t('cv.saving')}</>}
          {saveStatus === 'saved' && <><Check size={14} color="var(--success-400)" /> {t('cv.saved')}</>}
        </div>
      </div>

      {/* Editor layout */}
      <div className="cv-editor-layout">
        {/* Form Panel */}
        <div className="cv-editor-form">
          <div className="cv-editor-tabs">
            {SECTIONS.map(s => (
              <button key={s} className={`cv-editor-tab ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
                {t(sectionKeys[s] as any)}
              </button>
            ))}
          </div>
          <div className="cv-editor-form-content">
            {activeSection === 'personal' && (
              <div className="cv-editor-section">
                <div className="cv-editor-row">
                  <div className="input-group"><label className="input-label">{t('cv.field.fullName')}</label><input className="input-field" value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} /></div>
                  <div className="input-group"><label className="input-label">{t('cv.field.title')}</label><input className="input-field" value={data.personal.title} onChange={e => updatePersonal('title', e.target.value)} /></div>
                </div>
                <div className="cv-editor-row">
                  <div className="input-group"><label className="input-label">{t('cv.field.email')}</label><input className="input-field" type="email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} /></div>
                  <div className="input-group"><label className="input-label">{t('cv.field.phone')}</label><input className="input-field" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} /></div>
                </div>
                <div className="input-group"><label className="input-label">{t('cv.field.address')}</label><input className="input-field" value={data.personal.address} onChange={e => updatePersonal('address', e.target.value)} /></div>
                {/* Links */}
                <div className="cv-editor-section-header"><span className="input-label">{t('cv.field.links')}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => updateData({ ...data, personal: { ...data.personal, personalLinks: [...data.personal.personalLinks, { label: '', url: '' }] } })}><Plus size={14} /> {t('cv.field.addLink')}</button>
                </div>
                {data.personal.personalLinks.map((link, i) => (
                  <div key={i} className="cv-editor-row" style={{ alignItems: 'end' }}>
                    <div className="input-group"><input className="input-field" placeholder="Label" value={link.label} onChange={e => { const links = [...data.personal.personalLinks]; links[i] = { ...links[i], label: e.target.value }; updateData({ ...data, personal: { ...data.personal, personalLinks: links } }); }} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="input-group" style={{ flex: 1 }}><input className="input-field" placeholder="URL" value={link.url} onChange={e => { const links = [...data.personal.personalLinks]; links[i] = { ...links[i], url: e.target.value }; updateData({ ...data, personal: { ...data.personal, personalLinks: links } }); }} /></div>
                      <button className="btn btn-icon btn-danger btn-sm" onClick={() => { const links = data.personal.personalLinks.filter((_, j) => j !== i); updateData({ ...data, personal: { ...data.personal, personalLinks: links } }); }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'about' && (
              <div className="cv-editor-section">
                <div className="input-group">
                  <label className="input-label">{t('cv.section.about')}</label>
                  <textarea className="input-field" rows={6} value={data.about} onChange={e => updateData({ ...data, about: e.target.value })} placeholder={t('cv.section.about')} />
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.education')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('education', { id: '', school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.education || []).map(item => (
                  <div key={item.id} className="cv-editor-item">
                    <button className="btn btn-icon btn-danger btn-sm cv-editor-item-remove" onClick={() => removeItem('education', item.id)}><Trash2 size={14} /></button>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.school')}</label><input className="input-field" value={item.school} onChange={e => updateItem('education', item.id, { school: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.degree')}</label><input className="input-field" value={item.degree} onChange={e => updateItem('education', item.id, { degree: e.target.value })} /></div>
                    </div>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.field')}</label><input className="input-field" value={item.field} onChange={e => updateItem('education', item.id, { field: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.gpa')}</label><input className="input-field" value={item.gpa} onChange={e => updateItem('education', item.id, { gpa: e.target.value })} /></div>
                    </div>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.startDate')}</label><input className="input-field" type="month" value={item.startDate} onChange={e => updateItem('education', item.id, { startDate: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.endDate')}</label><input className="input-field" type="month" value={item.endDate} onChange={e => updateItem('education', item.id, { endDate: e.target.value })} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'experience' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.experience')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('experience', { id: '', company: '', position: '', startDate: '', endDate: '', description: '' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.experience || []).map(item => (
                  <div key={item.id} className="cv-editor-item">
                    <button className="btn btn-icon btn-danger btn-sm cv-editor-item-remove" onClick={() => removeItem('experience', item.id)}><Trash2 size={14} /></button>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.company')}</label><input className="input-field" value={item.company} onChange={e => updateItem('experience', item.id, { company: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.position')}</label><input className="input-field" value={item.position} onChange={e => updateItem('experience', item.id, { position: e.target.value })} /></div>
                    </div>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.startDate')}</label><input className="input-field" type="month" value={item.startDate} onChange={e => updateItem('experience', item.id, { startDate: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.endDate')}</label><input className="input-field" type="month" value={item.endDate} onChange={e => updateItem('experience', item.id, { endDate: e.target.value })} placeholder={t('cv.field.present')} /></div>
                    </div>
                    <div className="input-group"><label className="input-label">{t('cv.field.description')}</label><textarea className="input-field" rows={4} value={item.description} onChange={e => updateItem('experience', item.id, { description: e.target.value })} /></div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.skills')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('skills', { id: '', name: '', level: 'Intermediate' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.skills || []).map(item => (
                  <div key={item.id} className="cv-editor-item" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <div className="input-group" style={{ flex: 2 }}><input className="input-field" placeholder={t('cv.field.skillName')} value={item.name} onChange={e => updateItem('skills', item.id, { name: e.target.value })} /></div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <select className="input-field" value={item.level} onChange={e => updateItem('skills', item.id, { level: e.target.value })}>
                        {['Beginner','Intermediate','Advanced','Expert'].map(l => <option key={l} value={l}>{t(`level.${l}` as any)}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => removeItem('skills', item.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'languages' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.languages')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('languages', { id: '', name: '', proficiency: 'Intermediate' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.languages || []).map(item => (
                  <div key={item.id} className="cv-editor-item" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <div className="input-group" style={{ flex: 2 }}><input className="input-field" placeholder={t('cv.field.language')} value={item.name} onChange={e => updateItem('languages', item.id, { name: e.target.value })} /></div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <select className="input-field" value={item.proficiency} onChange={e => updateItem('languages', item.id, { proficiency: e.target.value })}>
                        {['Basic','Intermediate','Advanced','Native'].map(p => <option key={p} value={p}>{t(`proficiency.${p}` as any)}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => removeItem('languages', item.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.projects')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('projects', { id: '', name: '', description: '', url: '', technologies: [], startDate: '', endDate: '' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.projects || []).map(item => (
                  <div key={item.id} className="cv-editor-item">
                    <button className="btn btn-icon btn-danger btn-sm cv-editor-item-remove" onClick={() => removeItem('projects', item.id)}><Trash2 size={14} /></button>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.projectName')}</label><input className="input-field" value={item.name} onChange={e => updateItem('projects', item.id, { name: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.projectUrl')}</label><input className="input-field" value={item.url} onChange={e => updateItem('projects', item.id, { url: e.target.value })} /></div>
                    </div>
                    <div className="input-group"><label className="input-label">{t('cv.field.description')}</label><textarea className="input-field" rows={3} value={item.description} onChange={e => updateItem('projects', item.id, { description: e.target.value })} /></div>
                    <div className="input-group"><label className="input-label">{t('cv.field.technologies')}</label><input className="input-field" value={(item.technologies || []).join(', ')} onChange={e => updateItem('projects', item.id, { technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="React, Node.js, ..." /></div>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.startDate')}</label><input className="input-field" type="month" value={item.startDate} onChange={e => updateItem('projects', item.id, { startDate: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.endDate')}</label><input className="input-field" type="month" value={item.endDate} onChange={e => updateItem('projects', item.id, { endDate: e.target.value })} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'certificates' && (
              <div className="cv-editor-section">
                <div className="cv-editor-section-header"><h3 className="cv-editor-section-title">{t('cv.section.certificates')}</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem('certificates', { id: '', name: '', issuer: '', date: '', url: '' })}><Plus size={14} /> {t('cv.field.add')}</button>
                </div>
                {(data.certificates || []).map(item => (
                  <div key={item.id} className="cv-editor-item">
                    <button className="btn btn-icon btn-danger btn-sm cv-editor-item-remove" onClick={() => removeItem('certificates', item.id)}><Trash2 size={14} /></button>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.certName')}</label><input className="input-field" value={item.name} onChange={e => updateItem('certificates', item.id, { name: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.issuer')}</label><input className="input-field" value={item.issuer} onChange={e => updateItem('certificates', item.id, { issuer: e.target.value })} /></div>
                    </div>
                    <div className="cv-editor-row">
                      <div className="input-group"><label className="input-label">{t('cv.field.certDate')}</label><input className="input-field" type="month" value={item.date} onChange={e => updateItem('certificates', item.id, { date: e.target.value })} /></div>
                      <div className="input-group"><label className="input-label">{t('cv.field.certUrl')}</label><input className="input-field" value={item.url} onChange={e => updateItem('certificates', item.id, { url: e.target.value })} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="cv-preview-panel">
          <div className="cv-preview-header">
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Preview</span>
          </div>
          <div className="cv-preview-content">
            <div className="cv-preview-paper">
              {data.personal.fullName && <div className="cv-preview-name">{data.personal.fullName}</div>}
              {data.personal.title && <div className="cv-preview-title-text">{data.personal.title}</div>}
              <div className="cv-preview-contact">
                {data.personal.email && <span>{data.personal.email}</span>}
                {data.personal.phone && <span>• {data.personal.phone}</span>}
                {data.personal.address && <span>• {data.personal.address}</span>}
                {data.personal.personalLinks?.map((l, i) => l.url && <span key={i}>• <a href={l.url} style={{ color: '#4f46e5' }}>{l.label || l.url}</a></span>)}
              </div>

              {data.about && <div className="cv-preview-section"><div className="cv-preview-section-title">About</div><p style={{ fontSize: '12px', color: '#334155' }}>{data.about}</p></div>}

              {data.experience?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Experience</div>
                  {data.experience.map(item => (
                    <div key={item.id} className="cv-preview-item">
                      <div className="cv-preview-item-header"><span className="cv-preview-item-title">{item.position}</span><span className="cv-preview-item-date">{item.startDate} — {item.endDate || 'Present'}</span></div>
                      <div className="cv-preview-item-subtitle">{item.company}</div>
                      {item.description && <div className="cv-preview-item-desc">{item.description}</div>}
                    </div>
                  ))}
                </div>
              )}

              {data.education?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Education</div>
                  {data.education.map(item => (
                    <div key={item.id} className="cv-preview-item">
                      <div className="cv-preview-item-header"><span className="cv-preview-item-title">{item.degree} — {item.field}</span><span className="cv-preview-item-date">{item.startDate} — {item.endDate}</span></div>
                      <div className="cv-preview-item-subtitle">{item.school} {item.gpa && `• GPA: ${item.gpa}`}</div>
                    </div>
                  ))}
                </div>
              )}

              {data.skills?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Skills</div>
                  <div className="cv-preview-skills-grid">{data.skills.map(s => <span key={s.id} className="cv-preview-skill-tag">{s.name}</span>)}</div>
                </div>
              )}

              {data.languages?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Languages</div>
                  <div className="cv-preview-skills-grid">{data.languages.map(l => <span key={l.id} className="cv-preview-skill-tag">{l.name} — {l.proficiency}</span>)}</div>
                </div>
              )}

              {data.projects?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Projects</div>
                  {data.projects.map(item => (
                    <div key={item.id} className="cv-preview-item">
                      <div className="cv-preview-item-header"><span className="cv-preview-item-title">{item.name}</span><span className="cv-preview-item-date">{item.startDate} — {item.endDate}</span></div>
                      {item.description && <div className="cv-preview-item-desc">{item.description}</div>}
                      {item.technologies?.length > 0 && <div className="cv-preview-skills-grid" style={{ marginTop: 4 }}>{item.technologies.map((tech, i) => <span key={i} className="cv-preview-skill-tag">{tech}</span>)}</div>}
                    </div>
                  ))}
                </div>
              )}

              {data.certificates?.length > 0 && (
                <div className="cv-preview-section"><div className="cv-preview-section-title">Certificates</div>
                  {data.certificates.map(item => (
                    <div key={item.id} className="cv-preview-item">
                      <div className="cv-preview-item-header"><span className="cv-preview-item-title">{item.name}</span><span className="cv-preview-item-date">{item.date}</span></div>
                      <div className="cv-preview-item-subtitle">{item.issuer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
