export interface PersonalLink {
  label: string;
  url: string;
}

export interface PersonalInfo {
  avatar?: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  personalLinks: PersonalLink[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  level?: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface CVData {
  personal: PersonalInfo;
  about: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
  projects: ProjectEntry[];
  certificates: CertificateEntry[];
}

export interface CV {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  data: CVData;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  pdf_url?: string;
  html_template?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}