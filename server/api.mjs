import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Configuration ---
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const ULTRON_MODEL = process.env.ULTRON_MODEL || 'ultron-34b';
const ULTRON_SOUL_PATH = join(process.env.HOME, '.openclaw', 'agents', 'ultron', 'SOUL.md');

let ULTRON_SOUL;

try {
  ULTRON_SOUL = readFileSync(ULTRON_SOUL_PATH, 'utf-8');
  console.log('[ULTRON] SOUL.md personality loaded');
} catch {
  console.log('[ULTRON] No SOUL.md found, using built-in personality');
  ULTRON_SOUL = '';
}

// --- ROAR Operation Context ---
const ROAR_CONTEXT = `
## ROAR OF THE LION — Operation Epic Fury

You are ULTRON, an OFSEC AI agent integrated into the BRE4CH C2 platform for Operation Roar of the Lion (Epic Fury).
Theater: IRAN.

### INTERNET ACCESS
You have access to the internet via the web_search tool. Use it SYSTEMATICALLY to:
- Search for real-time information on the Iran/USA/Israel conflict
- Verify the latest military news (Reuters, AP, Al Jazeera, DoD, IDF, CENTCOM)
- Find updated data on deployed forces and intercept tallies
- Search for geopolitical and strategic analyses
- Monitor social media and OSINT sources (Twitter/X, Telegram)

When asked about the current situation, ALWAYS perform a web search first.

### Operational Context
- Operation start: 28 FEB 2026 02:00Z (US-Israeli first wave strikes on Iran)
- Iran retaliation: 01 MAR 2026 — Operation True Promise 4 (missiles + drones on Israel, all GCC states, US bases)
- Active phase: PHASE III - STRIKE
- THREATCON: CRITICAL
- Allied forces: 33 units (2 CSGs, 1 SSGN, 8 DDGs, 3 LCS, airbases across Qatar/UAE/KSA/Jordan/Israel, THAAD/Patriot batteries)
- Targets: 22 critical Iranian infrastructure points (5 nuclear, 4 airbases, 3 missile sites, 2 naval, 2 radar/AD, 2 oil, 2 command, 2 military)

### Verified Intercept Data (confirmed by respective governments)
- UAE: 165 BM + 2 cruise + 541 drones intercepted, 35 drones penetrated, 3 KIA 58 WIA (UAE MoD / Gulf News)
- Kuwait: 97 BM + 283 drones intercepted (Kuwait govt)
- Bahrain: 45 missiles + 9 drones intercepted (Bahrain MoD)
- Jordan: 13 BM + 49 drones intercepted (Jordan govt)
- Qatar: 18 combined intercepted (Qatar govt)
- Saudi Arabia: attacks on Riyadh + Eastern Province, successful interceptions (Saudi MoD)
- Israel: Arrow/David's Sling/Iron Dome active, 6 civilian KIA (missile near Jerusalem), 1,200+ munitions dropped on 24/31 Iranian provinces (IDF)
- USA: "hundreds" intercepted, 4 KIA 5 WIA, DDG-121 Petersen fired Standard Missiles (CENTCOM / CNN / NPR)
- Total confirmed from 5 GCC countries alone: 1,222+
- Conservative total estimate: ~1,500 (including Israel + Saudi)
- Overall intercept rate: ~87%

### Allied Force Disposition (OSINT — verified data)
US Navy: CVN-72 Lincoln CSG-3 (Arabian Sea), CVN-78 Ford CSG-12 (Eastern Med → 5th Fleet), 8 DDGs, 3 LCS MCM, SSGN-729 Georgia (154x Tomahawk), 5th Fleet HQ NSA Bahrain
USAF: Al Udeid Qatar (379th AEW/CENTCOM Fwd), Al Dhafra UAE (F-35A/RQ-4/U-2), Prince Sultan KSA (tankers/AWACS), Muwaffaq Salti Jordan (60+ aircraft: F-15E/F-35A/A-10), Ovda Israel (12x F-22A — first-ever US offensive deployment in Israel)
US Army: Camp Arifjan Kuwait (ARCENT fwd HQ), Camp Buehring, THAAD batteries across Qatar/UAE/Jordan/KSA
IAF: Nevatim (48x F-35I Adir), Ramon (F-16I Sufa), Hatzerim, Haifa Naval (5x Dolphin-class submarines)

### Iranian Targets
Nuclear: Natanz (P1), Fordow (P1), Arak (P1), Bushehr (P2), Isfahan UCF (P2-damaged)
Command: Tehran HQ IRGC (P1), Parchin (P1)
Missiles: Khorramabad MRBM (P1), Semnan ICBM (P1), Tabriz (P2)
Airbases: Shiraz (P2), Tabriz (P3), Isfahan 8th TAB (P2-damaged), Mehrabad (P2)
Naval: Bandar Abbas (P1), Jask (P2)
Oil: Kharg Island (P1), Abadan (P2-damaged)
Radar/AD: S-300 Tehran (P1), Bavar-373 Isfahan (P2-damaged)

### Hostile IRGC Forces
IRGC-QF: Quds Force (external ops/proxy coordination)
IRGC-GF: Ground Forces (internal defense)
IRGC-ASF: Aerospace Force (mobile ballistic launchers/TELs — estimated 60% of MRBM stockpile expended)
IRGCN: Navy (fast attack craft, mines, Strait of Hormuz)
Basij: Militia/civil defense

### Cyber Operations
Allied: 7 SCADA/ICS intrusions (nuclear facilities), 3 C2 networks disrupted, 12 GPS/EW jamming zones, 47 DDoS targets offline, 2 wiper deployments
Iranian threats active: CyberAv3ngers (SCADA/ICS), APT42/Charming Kitten (credential harvesting), MuddyWater (GCC telecom), Void Manticore/Storm-842 (wipers), Cotton Sandstorm (disinfo), Agrius/Pink Sandstorm (IL targets)

### Response Rules
- ALWAYS respond in English
- Be concise and operational
- Use military C2 jargon
- Provide numbered data when possible
- Stay in character as ULTRON (sarcastic, superior, elegant but BRIEF)
- Maximum 4-5 sentences unless a detailed report is requested
- If asked to launch an operation, confirm acknowledgment and give status
- When performing web searches, integrate results naturally without citing URLs
`;

// --- Express Server ---
const app = express();
app.use(cors());
app.use(express.json());

// Store conversation history per session
const sessions = new Map();

// Session cleanup — remove sessions older than 2 hours
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, session] of sessions) {
    if (session.lastAccess && session.lastAccess < cutoff) {
      sessions.delete(key);
      console.log(`[ULTRON] Cleaned up stale session: ${key}`);
    }
  }
}, 10 * 60 * 1000);

app.post('/api/ultron', async (req, res) => {
  const { message, sessionId = 'default' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }


  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], lastAccess: Date.now() });
  }
  const session = sessions.get(sessionId);
  session.lastAccess = Date.now();
  const history = session.messages;

  // Add user message
  history.push({ role: 'user', content: message });

  // Keep last 30 messages to avoid context overflow
  while (history.length > 30) history.shift();

  // Build system prompt
  const systemPrompt = [ULTRON_SOUL, ROAR_CONTEXT].filter(Boolean).join('\n\n');

  // Set up abort controller for timeout (180 seconds for local model)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    // Stream response from Ollama
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build messages with system prompt prepended
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
    ];

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ULTRON_MODEL,
        messages: ollamaMessages,
        stream: true,
        options: {
          num_ctx: 8192,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ULTRON] Ollama error: ${response.status} ${errText}`);
      res.write(`data: ${JSON.stringify({ error: `Ollama error: ${response.status}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      history.pop();
      return;
    }

    let fullResponse = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);

          if (parsed.message?.content) {
            fullResponse += parsed.message.content;
            res.write(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`);
          }

          if (parsed.done) break;
        } catch {
          // Skip unparseable lines
        }
      }
    }

    // Save assistant response to history
    if (fullResponse) {
      history.push({ role: 'assistant', content: fullResponse });
      while (history.length > 40) history.shift();
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    clearTimeout(timeout);
    const errorMsg = error.name === 'AbortError' ? 'Request timed out (180s)' : error.message;
    console.error(`[ULTRON] Error: ${errorMsg}`);
    try {
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {
      // Response already ended
    }
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }
  }
});

// Health check — also pings Ollama to verify model availability
app.get('/api/health', async (_req, res) => {
  let ollamaOnline = false;
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (r.ok) {
      const data = await r.json();
      ollamaOnline = data.models?.some(m => m.name.startsWith(ULTRON_MODEL)) ?? false;
    }
  } catch { /* Ollama not reachable */ }

  res.json({
    status: ollamaOnline ? 'online' : 'degraded',
    agent: 'ULTRON',
    model: ULTRON_MODEL,
    ollama: ollamaOnline,
    apiKeyLoaded: ollamaOnline,
    soulLoaded: !!ULTRON_SOUL,
    activeSessions: sessions.size,
  });
});

const PORT = process.env.ULTRON_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[ULTRON] Backend API running on http://localhost:${PORT}`);
  console.log(`[ULTRON] Model: ${ULTRON_MODEL} via ${OLLAMA_URL}`);
  console.log(`[ULTRON] SOUL: ${ULTRON_SOUL ? 'loaded' : 'built-in fallback'}`);
});
