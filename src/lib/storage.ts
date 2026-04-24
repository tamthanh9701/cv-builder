import { CVData, createEmptyCV } from '@/types';
import { createClient } from './supabase';

const CV_STORAGE_KEY = 'cv_builder_cvs';

export function getLocalCVs(): CVData[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CV_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLocalCVs(cvs: CVData[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvs));
}

export async function fetchCVs(userId: string): Promise<CVData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cvs')
    .select('data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(row => row.data as CVData) || [];
}

export async function saveCV(userId: string, cvData: CVData, name: string, templateId?: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('cvs')
    .insert({
      user_id: userId,
      data: cvData,
      name,
      template_id: templateId || null,
    });

  if (error) throw error;
}

export async function updateCV(cvId: string, cvData: CVData, name?: string) {
  const supabase = createClient();
  const updates: Record<string, unknown> = { data: cvData };
  if (name) updates.name = name;

  const { error } = await supabase
    .from('cvs')
    .update(updates)
    .eq('id', cvId);

  if (error) throw error;
}

export async function deleteCV(cvId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', cvId);

  if (error) throw error;
}

export async function setDefaultCV(cvId: string, userId: string) {
  const supabase = createClient();
  
  await supabase
    .from('cvs')
    .update({ is_default: false })
    .eq('user_id', userId);

  const { error } = await supabase
    .from('cvs')
    .update({ is_default: true })
    .eq('id', cvId);

  if (error) throw error;
}