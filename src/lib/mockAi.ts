export type AiTone = 'Professional' | 'Casual' | 'Creative' | 'Concise' | 'Empathetic';
export type AiFormat = 'Email' | 'WhatsApp' | 'LinkedIn Post' | 'Jira Ticket' | 'Slack Message' | 'Tweet';

const toneDescriptions: Record<AiTone, string> = {
  Professional: 'formal and precise',
  Casual: 'relaxed and friendly',
  Creative: 'imaginative and vivid',
  Concise: 'short and to the point',
  Empathetic: 'warm and understanding',
};

const formatTemplates: Record<AiFormat, (tone: AiTone, msg: string) => string> = {
  Email: (tone, msg) =>
    `Here is a ${tone} Email based on your request:\n\nSubject: Re: ${msg.slice(0, 50)}${msg.length > 50 ? '…' : ''}\n\nDear [Recipient],\n\nI hope this message finds you well. I am writing in a ${toneDescriptions[tone]} manner to address the following: "${msg}".\n\nPlease feel free to reach out should you require any further clarification.\n\nBest regards,\n[Your Name]`,

  WhatsApp: (tone, msg) =>
    `Here is a ${tone} WhatsApp Message based on your request:\n\nHey! 👋 Just wanted to drop a quick note about "${msg}". Keeping it ${toneDescriptions[tone]} — let me know what you think and we can go from there. Lmk! 🙌`,

  'LinkedIn Post': (tone, msg) =>
    `Here is a ${tone} LinkedIn Post based on your request:\n\n🚀 Excited to share some thoughts on "${msg}".\n\nIn today's fast-paced world, approaching this topic in a ${toneDescriptions[tone]} way is more important than ever. Here's what I've learned:\n\n✅ Clarity drives results\n✅ Consistency builds trust\n✅ Collaboration unlocks potential\n\nWhat are your thoughts? Drop a comment below! 👇\n\n#Insights #Growth #Leadership`,

  'Jira Ticket': (tone, msg) =>
    `Here is a ${tone} Jira Ticket based on your request:\n\n**Summary:** ${msg.slice(0, 60)}${msg.length > 60 ? '…' : ''}\n\n**Description:**\nThis ticket addresses the following: "${msg}". The tone of communication for this task should remain ${toneDescriptions[tone]}.\n\n**Acceptance Criteria:**\n- [ ] Requirement clearly defined\n- [ ] Implementation reviewed\n- [ ] Tests passing\n\n**Priority:** Medium\n**Labels:** toneshift, ai-generated`,

  'Slack Message': (tone, msg) =>
    `Here is a ${tone} Slack Message based on your request:\n\n@channel — quick heads up on "${msg}" 👀\n\nKeeping this ${toneDescriptions[tone]}: the key takeaway is that we need to align on this ASAP. Can someone take a look and share feedback in the thread? 🧵\n\nThanks! 🙏`,

  Tweet: (tone, msg) =>
    `Here is a ${tone} Tweet based on your request:\n\n"${msg.slice(0, 80)}${msg.length > 80 ? '…' : ''}"\n\nSaid in a ${toneDescriptions[tone]} way — because that's how we roll. 🔥\n\n#ToneShift #AI #ContentCreation`,
};

export async function generateAiResponse(
  userMessage: string,
  selectedTone: AiTone,
  onChunk?: (chunk: string) => void,
  selectedFormat: AiFormat = 'Email'
): Promise<string> {
  const fullResponse = formatTemplates[selectedFormat](selectedTone, userMessage);

  return new Promise((resolve) => {
    if (!onChunk) {
      setTimeout(() => resolve(fullResponse), 1500);
      return;
    }

    // Streaming simulation — emit word by word
    const words = fullResponse.split(' ');
    let index = 0;
    let accumulated = '';

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        resolve(accumulated);
        return;
      }
      const chunk = (index === 0 ? '' : ' ') + words[index];
      accumulated += chunk;
      onChunk(accumulated);
      index++;
    }, 40);
  });
}
