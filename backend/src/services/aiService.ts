import OpenAI from 'openai';

const client = (() => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
})();

export async function getRecommendations(goals: Array<{ title: string; description?: string }>): Promise<string> {
  if (!client) return 'AI is not configured. Set OPENAI_API_KEY.';
  const prompt = `User yearly goals: ${JSON.stringify(goals)}. Provide concise, actionable strategies and milestones.`;
  const res = await client.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
  });
  // @ts-expect-error minimal extraction
  return res.output_text || 'No response';
}

export async function getMoodboardSuggestions(existing: Array<{ type: string; content: string }>): Promise<string> {
  if (!client) return 'AI is not configured. Set OPENAI_API_KEY.';
  const prompt = `Existing mood board items: ${JSON.stringify(existing)}. Suggest 5 new inspirational visual ideas (short).`;
  const res = await client.responses.create({ model: 'gpt-4o-mini', input: prompt });
  // @ts-expect-error minimal extraction
  return res.output_text || 'No response';
}

export async function getMotivation(context: { mood?: string; progress?: number }): Promise<string> {
  if (!client) return 'AI is not configured. Set OPENAI_API_KEY.';
  const prompt = `User context: ${JSON.stringify(context)}. Provide a short, uplifting, personalized message (2 sentences).`;
  const res = await client.responses.create({ model: 'gpt-4o-mini', input: prompt });
  // @ts-expect-error minimal extraction
  return res.output_text || 'No response';
}

export async function getAdjustments(goal: { title: string; status?: string; obstacles?: string }): Promise<string> {
  if (!client) return 'AI is not configured. Set OPENAI_API_KEY.';
  const prompt = `Goal: ${JSON.stringify(goal)}. Suggest a recalibrated plan with 3 pragmatic adjustments.`;
  const res = await client.responses.create({ model: 'gpt-4o-mini', input: prompt });
  // @ts-expect-error minimal extraction
  return res.output_text || 'No response';
}

export async function getSummary(inputs: { goals: any[]; progress: any[]; reflections?: string }): Promise<string> {
  if (!client) return 'AI is not configured. Set OPENAI_API_KEY.';
  const prompt = `Year-end summary. Goals: ${JSON.stringify(inputs.goals)}. Progress: ${JSON.stringify(inputs.progress)}. Reflections: ${inputs.reflections || ''}. Provide a positive summary and next-year tips.`;
  const res = await client.responses.create({ model: 'gpt-4o-mini', input: prompt });
  // @ts-expect-error minimal extraction
  return res.output_text || 'No response';
}



