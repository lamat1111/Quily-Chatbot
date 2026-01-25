import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Test route body:', body);

    const openrouter = createOpenRouter({ apiKey: body.apiKey || 'test' });

    const result = streamText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      messages: [{ role: 'user', content: 'Say hello' }],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
