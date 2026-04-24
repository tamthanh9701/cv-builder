export type AIProviderType = 'openai' | 'anthropic' | 'openrouter' | 'litellm' | 'google' | 'vertexai';

export interface AIProviderConfig {
  type: AIProviderType;
  api_key: string;
  base_url: string;
  model: string;
  enabled: boolean;
  vertex_project?: string;
  vertex_location?: string;
  vertex_credentials?: string;
}

export interface AppSettings {
  active_provider: AIProviderType;
  providers: Record<AIProviderType, AIProviderConfig>;
}

export const DEFAULT_PROVIDERS: Record<AIProviderType, Omit<AIProviderConfig, 'api_key'>> = {
  openai: { type: 'openai', base_url: 'https://api.openai.com/v1', model: 'gpt-4o', enabled: false },
  anthropic: { type: 'anthropic', base_url: 'https://api.anthropic.com', model: 'claude-sonnet-4-20250514', enabled: false },
  openrouter: { type: 'openrouter', base_url: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o', enabled: false },
  litellm: { type: 'litellm', base_url: 'http://localhost:4000', model: 'gpt-4o', enabled: false },
  google: { type: 'google', base_url: 'https://generativelanguage.googleapis.com', model: 'gemini-2.0-flash', enabled: false },
  vertexai: { type: 'vertexai', base_url: '', model: 'gemini-2.0-flash', enabled: false },
};

export function createDefaultSettings(): AppSettings {
  return {
    active_provider: 'openai',
    providers: Object.fromEntries(
      Object.entries(DEFAULT_PROVIDERS).map(([key, value]) => [key, { ...value, api_key: '' }])
    ) as Record<AIProviderType, AIProviderConfig>,
  };
}