export * from './ai';
export * from './cv';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function createEmptyCV(): CVData {
  return {
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
}