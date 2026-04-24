import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { provider, type } = await request.json();

    const systemPrompt = 'You are a helpful assistant. Respond with "OK" if you can understand this message.';
    const userPrompt = 'Say "OK" if you receive this.';

    let response;
    let success = false;

    if (type === 'openai' || type === 'openrouter' || type === 'litellm') {
      response = await fetch(`${provider.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.api_key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 10,
        }),
      });
      success = response.ok;
    } else if (type === 'anthropic') {
      response = await fetch(`${provider.base_url}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.api_key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: provider.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      success = response.ok;
    } else if (type === 'google') {
      response = await fetch(
        `${provider.base_url}/v1beta/models/${provider.model}:generateContent?key=${provider.api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      success = response.ok;
    } else if (type === 'vertexai') {
      const { VertexAI } = await import('@google-cloud/vertexai');
      const vertexAI = new VertexAI({ project: provider.vertex_project, location: provider.vertex_location });
      const generativeModel = vertexAI.getGenerativeModel({ model: provider.model });

      try {
        const result = await generativeModel.generateContent(userPrompt);
        success = !!result?.response;
      } catch (e) {
        success = false;
      }
    }

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}