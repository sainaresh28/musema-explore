import type { Message } from './emotionAI';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export const groqApi = {
  chat: async (
    systemPrompt: string,
    messages: Message[],
    userMessage: string
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return "API key error , invalid";
    }

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: formattedMessages,
        max_tokens: 4000,
        temperature: 0.5,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq API error');
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  },

  // Streaming version — calls onToken with each chunk as it arrives
  chatStream: async (
    systemPrompt: string,
    messages: Message[],
    userMessage: string,
    onToken: (token: string, done: boolean) => void
  ): Promise<void> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      onToken(" API key error.", true);
      return;
    }

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: formattedMessages,
        max_tokens: 4000,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq API error');
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) { onToken('', true); break; }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') { onToken('', true); return; }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) onToken(token, false);
        } catch { /* skip malformed chunks */ }
      }
    }
  }
};