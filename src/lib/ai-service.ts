import { createServerSupabaseClient } from './supabase-server';
import { AIProviderType, AIProviderConfig, AppSettings, createDefaultSettings } from '@/types/ai';

interface AIResponse {
  content: string;
  error?: string;
}

async function callOpenAI(provider: AIProviderConfig, messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${provider.base_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.api_key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callAnthropic(provider: AIProviderConfig, messages: { role: string; content: string }[]): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${provider.base_url}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.api_key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function callGemini(provider: AIProviderConfig, messages: { role: string; content: string }[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || '';

  const response = await fetch(
    `${provider.base_url}/v1beta/models/${provider.model}:generateContent?key=${provider.api_key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: lastMessage }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('app_settings')
    .select('settings')
    .single();

  return data?.settings ? { ...createDefaultSettings(), ...data.settings } : createDefaultSettings();
}

export async function callAI(messages: { role: string; content: string }[]): Promise<AIResponse> {
  try {
    const settings = await getAppSettings();
    const provider = settings.providers[settings.active_provider];

    if (!provider?.enabled || !provider?.api_key) {
      return { content: '', error: 'AI provider not configured' };
    }

    let content = '';

    switch (settings.active_provider) {
      case 'openai':
      case 'openrouter':
      case 'litellm':
        content = await callOpenAI(provider, messages);
        break;
      case 'anthropic':
        content = await callAnthropic(provider, messages);
        break;
      case 'google':
        content = await callGemini(provider, messages);
        break;
      case 'vertexai':
        const { VertexAI } = await import('@google-cloud/vertexai');
        const vertexAI = new VertexAI({
          project: provider.vertex_project!,
          location: provider.vertex_location!,
        });
        const model = vertexAI.getGenerativeModel({ model: provider.model });
        const lastMessage = messages[messages.length - 1]?.content || '';
        const result = await model.generateContent(lastMessage);
        content = result.response.text();
        break;
      default:
        return { content: '', error: 'Unknown provider' };
    }

    return { content };
  } catch (error) {
    return { content: '', error: String(error) };
  }
}

export async function analyzeCV(
  cvContent: string,
  jobDescription: string,
  targetJobUrl?: string
): Promise<{ suggestions: string; improvedCV: any }> {
  const systemPrompt = `Bạn là chuyên gia tư vấn CV hàng đầu. Bạn sẽ phân tích CV của người dùng và so sánh với yêu cầu của công việc để đưa ra đề xuất cải thiện.

Hãy phân tích và trả về JSON với format:
{
  "suggestions": "Danh sách các điểm cần cải thiện trong CV để phù hợp hơn với công việc. Mỗi điểm cần nêu rõ lý do và cách cải thiện.",
  "improvedCV": { /* CV đã được cải thiện với các thay đổi cụ thể, giữ nguyên format của CV gốc */ }
}

Hãy đưa ra những suggest cụ thể và thực tế, phù hợp với thị trường lao động Việt Nam.`;

  const userPrompt = `## CV Hiện tại:
${cvContent}

## Yêu cầu công việc:
${jobDescription}
${targetJobUrl ? `\nLink công việc: ${targetJobUrl}` : ''}

Hãy phân tích CV và đưa ra JSON với suggestions và improvedCV.`;

  const result = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (result.error) {
    throw new Error(result.error);
  }

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}

export async function generateCVFromTemplate(
  pdfContent: string,
  templateHtml: string
): Promise<string> {
  const systemPrompt = `Bạn là chuyên gia thiết kế CV. Nhiệm vụ của bạn là phân tích PDF của một mẫu CV và tạo ra HTML template tương ứng.

Hãy trả về HTML template hoàn chỉnh bao gồm:
1. CSS inline cho styling đẹp mắt
2. Cấu trúc HTML với các placeholder cho data
3. Layout giữ nguyên như PDF gốc

HTML template cần có các placeholder format như: {{fullName}}, {{title}}, {{email}}, v.v.

Trả về JSON: { "htmlTemplate": "<html>...</html>" }`;

  const userPrompt = `## PDF Content (nếu có text):
${pdfContent.substring(0, 5000)}

## Template HTML có sẵn (nếu có):
${templateHtml || 'Chưa có'}

Hãy tạo HTML template cho CV này.`;

  const result = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (result.error) {
    throw new Error(result.error);
  }

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.htmlTemplate || result.content;
    }
    return result.content;
  } catch (error) {
    return result.content;
  }
}