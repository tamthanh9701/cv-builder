// ============================================================
// CV Builder — Core TypeScript Types
// ============================================================

// --- CV Data Schema (stored as JSONB in `cvs.data`) ---

export interface PersonalLink {
  label: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  personalLinks: PersonalLink[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
  startDate: string;
  endDate: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CVData {
  personal: PersonalInfo;
  about: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certificates: Certificate[];
}

// --- Database Row Types ---

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface CV {
  id: string;
  user_id: string;
  name: string;
  data: CVData;
  template_id: string | null;
  is_default: boolean;
  cloned_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  html_template: string | null;
  css_template: string | null;
  layout_config: Record<string, unknown> | null;
  category: string;
  is_active: boolean;
  ai_detected: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVAnalysis {
  id: string;
  user_id: string;
  cv_id: string;
  job_title: string | null;
  job_url: string | null;
  job_description: string;
  analysis_result: AnalysisResult;
  overall_score: number | null;
  created_at: string;
}

export interface AnalysisResult {
  overallScore: number;
  categories: {
    relevance: number;
    skills: number;
    experience: number;
    education: number;
    presentation: number;
  };
  strengths: string[];
  gaps: string[];
  suggestions: {
    section: string;
    current: string;
    recommended: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
}

// --- i18n ---

export type Locale = 'vi' | 'en';

// --- Helpers ---

export const emptyCVData: CVData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    personalLinks: [],
  },
  about: '',
  education: [],
  experience: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: [],
};

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
