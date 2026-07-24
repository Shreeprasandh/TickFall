// AI Heist Commentator & Noir Newspaper Generator powered by Gemini API

export class AIReporterService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Standard Gemini 1.5 Flash endpoint
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async generateMatchReport(matchData) {
    if (!this.apiKey) return null;

    const prompt = `
You are the veteran crime reporter for The Castellan Daily News in a 1950s noir heist thriller.
Write a dramatic, atmospheric front-page newspaper article based on this match telemetry:

- Winner: ${matchData.winner === 'THIEF' ? 'CIPHER (The Thief)' : 'VALE (The Detective)'}
- Victory Details: ${matchData.reason}
- Match Duration: ${Math.floor(matchData.timeTaken || 120)} seconds
- Time Remaining on Bomb: ${matchData.timeRemaining || '0:00'}
- Bomb Status: ${matchData.bombStatus || 'Active'}

Respond STRICTLY in valid JSON format with three fields:
{
  "headline": "DRAMATIC ALL-CAPS NEWSPAPER HEADLINE (MAX 10 WORDS)",
  "lead": "Compelling 1-2 sentence breaking lead paragraph.",
  "story": "Atmospheric 2-paragraph noir crime story detailing Cipher's descent down the 40 floors of Castellan Tower and Vale's desperate pursuit."
}
`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        console.warn('AI API response error:', response.statusText);
        return null;
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        return JSON.parse(textResponse);
      }
    } catch (err) {
      console.error('Failed to generate AI Heist Story:', err);
    }
    return null;
  }
}
