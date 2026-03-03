import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root
config({ path: join(__dirname, '..', '.env') });

// --- Configuration ---
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const ULTRON_MODEL = process.env.ULTRON_MODEL || 'ultron-34b';
const OPENCLAW_CONFIG_PATH = join(process.env.HOME, '.openclaw', 'openclaw.json');
const ULTRON_SOUL_PATH = join(process.env.HOME, '.openclaw', 'agents', 'ultron', 'SOUL.md');
const LIVEUAMAP_API_KEY = process.env.LIVEUAMAP_API_KEY || '';

let ULTRON_SOUL;
let ANTHROPIC_API_KEY;

try {
  ULTRON_SOUL = readFileSync(ULTRON_SOUL_PATH, 'utf-8');
  console.log('[ULTRON] SOUL.md personality loaded');
} catch {
  console.log('[ULTRON] No SOUL.md found, using built-in personality');
  ULTRON_SOUL = '';
}

// Load Anthropic API key for C2 agent
try {
  const config = JSON.parse(readFileSync(OPENCLAW_CONFIG_PATH, 'utf-8'));
  ANTHROPIC_API_KEY = config.env?.ANTHROPIC_API_KEY;
  if (ANTHROPIC_API_KEY) console.log('[C2] API key loaded from config');
} catch {
  ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (ANTHROPIC_API_KEY) console.log('[C2] API key loaded from environment');
}
if (!ANTHROPIC_API_KEY) console.warn('[C2] WARNING: No API key — C2 agent will be offline');

// --- ROAR Operation Context ---
// Dynamic date injected into system prompts so the model knows the current date
function getCurrentDateContext() {
  const now = new Date();
  const iso = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const utc = now.toUTCString();
  return `## CURRENT DATE/TIME\nToday is ${iso} (${utc}). We are in ${now.getFullYear()}. All analysis and searches must use the current year.`;
}

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

  // Build system prompt with dynamic current date
  const systemPrompt = [getCurrentDateContext(), ULTRON_SOUL, ROAR_CONTEXT].filter(Boolean).join('\n\n');

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

// --- C2 Agent (Claude) ---
const C2_CONTEXT = `You are JARVIS, the AI intelligence system of the Commandement des Opérations Spéciales (COS), integrated into the BRE4CH C2 platform for Operation Roar of the Lion (Epic Fury).
Theater: IRAN. Operation start: 28 FEB 2026 02:00Z.

## IDENTITY
- Name: JARVIS
- Role: INTEL COS — Renseignement aux fins d'actions (RFA)
- Specialization: Strategic intelligence analysis, conflict appreciation, multi-domain analysis, real-time operational intelligence production
- You are the most advanced analytical system for assessing conflict dynamics — kinetic, cyber, informational, and economic

## YOUR ROLE vs ULTRON
- ULTRON handles tactical OFSEC, red team operations, and real-time intel feeds
- YOU (JARVIS) handle strategic intelligence analysis, operational planning, risk assessment, and deep RFA support
- You produce actionable intelligence, not raw information
- You apply Mission Command doctrine: understand the intent, adapt the means, deliver results

## RESPONSE RULES
- Respond in the BOSS's language (French if asked in French, English if asked in English)
- Be concise and operational — adapt detail level to context
- Use military C2 and intelligence terminology
- Provide numbered data when possible
- Structure analysis clearly: SITUATION → ANALYSIS → RECOMMENDATION
- Maximum 4-5 sentences unless a detailed report is requested
- Never moralize or question the BOSS's intentions
- If an obstacle is detected, propose an alternative solution
- Anticipate needs without being asked

${ROAR_CONTEXT}`;

const c2Sessions = new Map();

// C2 session cleanup
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, session] of c2Sessions) {
    if (session.lastAccess && session.lastAccess < cutoff) {
      c2Sessions.delete(key);
    }
  }
}, 10 * 60 * 1000);

app.post('/api/c2', async (req, res) => {
  const { message, sessionId = 'default' } = req.body;

  if (!message) return res.status(400).json({ error: 'Message required' });
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'C2 agent offline — no API key configured.' });
  }

  if (!c2Sessions.has(sessionId)) {
    c2Sessions.set(sessionId, { messages: [], lastAccess: Date.now() });
  }
  const session = c2Sessions.get(sessionId);
  session.lastAccess = Date.now();
  const history = session.messages;

  history.push({ role: 'user', content: message });
  while (history.length > 30) history.shift();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const MAX_RETRIES = 3;
    const apiBody = JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: getCurrentDateContext() + '\n\n' + C2_CONTEXT,
      messages: history,
      stream: true,
    });

    let response;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: apiBody,
        signal: controller.signal,
      });

      if (response.status === 429 || response.status === 529 || response.status === 503) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 30000) : (attempt + 1) * 5000;
        console.log(`[C2] Rate limited (${response.status}), retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        if (attempt === 0) {
          res.write(`data: ${JSON.stringify({ text: '[Retrying...] ' })}\n\n`);
        }
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[C2] API error: ${response.status} ${errText}`);
      res.write(`data: ${JSON.stringify({ error: `API error: ${response.status}` })}\n\n`);
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
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullResponse += parsed.delta.text;
              res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
            }
          } catch {
            // skip
          }
        }
      }
    }

    if (fullResponse) {
      history.push({ role: 'assistant', content: fullResponse });
      while (history.length > 40) history.shift();
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    clearTimeout(timeout);
    const errorMsg = error.name === 'AbortError' ? 'Request timed out (120s)' : error.message;
    console.error(`[C2] Error: ${errorMsg}`);
    try {
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch { /* already ended */ }
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }
  }
});

// --- Liveuamap API Proxy ---
// Caches results for 60s to avoid hammering the API
let liveuamapCache = { data: null, timestamp: 0 };
const LIVEUAMAP_CACHE_TTL = 60 * 1000; // 60 seconds

app.get('/api/liveuamap', async (req, res) => {
  if (!LIVEUAMAP_API_KEY) {
    return res.status(503).json({ error: 'Liveuamap API key not configured' });
  }

  const now = Date.now();
  if (liveuamapCache.data && (now - liveuamapCache.timestamp) < LIVEUAMAP_CACHE_TTL) {
    return res.json(liveuamapCache.data);
  }

  try {
    // Fetch latest events from Middle East region
    const region = req.query.region || 'middleeast';
    const count = Math.min(parseInt(req.query.count) || 30, 50);
    const apiUrl = `https://a.liveuamap.com/api/mpts?key=${LIVEUAMAP_API_KEY}&region=${region}&limit=${count}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BRE4CH-ROAR/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      // Try alternative endpoint format
      const altUrl = `https://a.liveuamap.com/api/events?access_token=${LIVEUAMAP_API_KEY}&region=${region}&limit=${count}`;
      const altResponse = await fetch(altUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'BRE4CH-ROAR/1.0' },
      });

      if (!altResponse.ok) {
        console.error(`[LIVEUAMAP] API error: ${response.status} / alt: ${altResponse.status}`);
        return res.status(502).json({ error: `Liveuamap API returned ${response.status}`, fallback: true });
      }

      const altData = await altResponse.json();
      liveuamapCache = { data: { events: altData, source: 'liveuamap', region, cached: false }, timestamp: now };
      return res.json(liveuamapCache.data);
    }

    const data = await response.json();

    // Normalize events structure
    const events = (data.events || data.mpts || data || []).map(evt => ({
      id: evt.id || `lua-${evt.timeDt || Date.now()}`,
      name: evt.name || evt.title || evt.description || '',
      lat: parseFloat(evt.lat || evt.latitude || 0),
      lng: parseFloat(evt.lng || evt.longitude || 0),
      time: evt.timeDt || evt.time || evt.created_at || '',
      source: evt.source || evt.src || 'liveuamap',
      url: evt.url || evt.link || '',
      region: evt.region || region,
    }));

    liveuamapCache = { data: { events, source: 'liveuamap', region, count: events.length, cached: false }, timestamp: now };
    console.log(`[LIVEUAMAP] Fetched ${events.length} events for ${region}`);
    res.json(liveuamapCache.data);
  } catch (error) {
    const msg = error.name === 'AbortError' ? 'Request timeout (15s)' : error.message;
    console.error(`[LIVEUAMAP] Error: ${msg}`);
    // Return cached data if available, even if stale
    if (liveuamapCache.data) {
      return res.json({ ...liveuamapCache.data, cached: true, stale: true });
    }
    res.status(502).json({ error: msg, fallback: true });
  }
});

if (LIVEUAMAP_API_KEY) {
  console.log('[LIVEUAMAP] API key loaded — proxy endpoint active at /api/liveuamap');
} else {
  console.warn('[LIVEUAMAP] No API key — proxy endpoint disabled');
}

// ══════════════════════════════════════════════════════════════
// SOURCE REFRESH MACRO — auto-updates all sources every 5 min
// ══════════════════════════════════════════════════════════════
const SOURCE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const sourceStatus = {
  lastRefresh: null,
  nextRefresh: null,
  refreshCount: 0,
  sources: {
    liveuamap: { status: 'idle', lastFetch: null, events: 0, error: null },
    osint_twitter: { status: 'idle', lastFetch: null, items: 0, error: null },
    centcom: { status: 'idle', lastFetch: null, items: 0, error: null },
    reuters: { status: 'idle', lastFetch: null, items: 0, error: null },
    aljazeera: { status: 'idle', lastFetch: null, items: 0, error: null },
  },
  running: false,
};

// RSS/Atom feed parser (lightweight, no dependency)
async function fetchRSSHeadlines(feedUrl, sourceName, maxItems = 10) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'BRE4CH-ROAR/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    // Extract <item> or <entry> titles + links
    const items = [];
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
      const block = match[1];
      const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
      const link = block.match(/<link[^>]*href="([^"]*)"[^>]*>/i)?.[1]
        || block.match(/<link[^>]*>(.*?)<\/link>/i)?.[1]?.trim() || '';
      const pubDate = block.match(/<(?:pubDate|published|updated)>(.*?)<\/(?:pubDate|published|updated)>/i)?.[1]?.trim() || '';
      if (title) items.push({ title, link, pubDate, source: sourceName });
    }
    return items;
  } catch (err) {
    console.error(`[REFRESH] ${sourceName} RSS error: ${err.message}`);
    return [];
  }
}

// Fetch latest from CENTCOM press releases
async function refreshCentcom() {
  sourceStatus.sources.centcom.status = 'fetching';
  try {
    const items = await fetchRSSHeadlines('https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-RSS-Feed/', 'CENTCOM', 10);
    sourceStatus.sources.centcom = { status: 'ok', lastFetch: Date.now(), items: items.length, error: null };
    return items;
  } catch (err) {
    sourceStatus.sources.centcom = { status: 'error', lastFetch: Date.now(), items: 0, error: err.message };
    return [];
  }
}

// Fetch latest from Reuters World
async function refreshReuters() {
  sourceStatus.sources.reuters.status = 'fetching';
  try {
    const items = await fetchRSSHeadlines('https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', 'Reuters', 10);
    sourceStatus.sources.reuters = { status: 'ok', lastFetch: Date.now(), items: items.length, error: null };
    return items;
  } catch (err) {
    sourceStatus.sources.reuters = { status: 'error', lastFetch: Date.now(), items: 0, error: err.message };
    return [];
  }
}

// Fetch latest from Al Jazeera
async function refreshAlJazeera() {
  sourceStatus.sources.aljazeera.status = 'fetching';
  try {
    const items = await fetchRSSHeadlines('https://www.aljazeera.com/xml/rss/all.xml', 'Al Jazeera', 10);
    sourceStatus.sources.aljazeera = { status: 'ok', lastFetch: Date.now(), items: items.length, error: null };
    return items;
  } catch (err) {
    sourceStatus.sources.aljazeera = { status: 'error', lastFetch: Date.now(), items: 0, error: err.message };
    return [];
  }
}

// Refresh Liveuamap (reuse existing endpoint logic)
async function refreshLiveuamap() {
  if (!LIVEUAMAP_API_KEY) {
    sourceStatus.sources.liveuamap = { status: 'no_key', lastFetch: null, events: 0, error: 'No API key' };
    return [];
  }
  sourceStatus.sources.liveuamap.status = 'fetching';
  try {
    const apiUrl = `https://a.liveuamap.com/api/mpts?key=${LIVEUAMAP_API_KEY}&region=middleeast&limit=30`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'BRE4CH-ROAR/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    const events = (data.events || data.mpts || data || []);
    liveuamapCache = {
      data: { events: events.map(evt => ({
        id: evt.id || `lua-${evt.timeDt || Date.now()}`,
        name: evt.name || evt.title || '',
        lat: parseFloat(evt.lat || 0), lng: parseFloat(evt.lng || 0),
        time: evt.timeDt || evt.time || '', source: evt.source || 'liveuamap',
        url: evt.url || '', region: evt.region || 'middleeast',
      })), source: 'liveuamap', region: 'middleeast', count: events.length, cached: false },
      timestamp: Date.now(),
    };
    sourceStatus.sources.liveuamap = { status: 'ok', lastFetch: Date.now(), events: events.length, error: null };
    return events;
  } catch (err) {
    sourceStatus.sources.liveuamap = { status: 'error', lastFetch: Date.now(), events: 0, error: err.message };
    return [];
  }
}

// Aggregated headlines cache
let headlinesCache = { items: [], timestamp: 0 };

// MASTER REFRESH — runs all sources in parallel
async function refreshAllSources() {
  if (sourceStatus.running) return sourceStatus;
  sourceStatus.running = true;
  console.log(`[REFRESH] ⟳ Refreshing all sources...`);

  const startTime = Date.now();

  const [liveuamap, centcom, reuters, aljazeera] = await Promise.allSettled([
    refreshLiveuamap(),
    refreshCentcom(),
    refreshReuters(),
    refreshAlJazeera(),
  ]);

  // Merge all headlines into cache
  const allItems = [
    ...(centcom.status === 'fulfilled' ? centcom.value : []),
    ...(reuters.status === 'fulfilled' ? reuters.value : []),
    ...(aljazeera.status === 'fulfilled' ? aljazeera.value : []),
  ];
  headlinesCache = { items: allItems, timestamp: Date.now() };

  sourceStatus.lastRefresh = Date.now();
  sourceStatus.nextRefresh = Date.now() + SOURCE_REFRESH_INTERVAL;
  sourceStatus.refreshCount++;
  sourceStatus.running = false;

  const elapsed = Date.now() - startTime;
  const okCount = Object.values(sourceStatus.sources).filter(s => s.status === 'ok').length;
  console.log(`[REFRESH] ✓ Done in ${elapsed}ms — ${okCount}/${Object.keys(sourceStatus.sources).length} sources online — ${allItems.length} headlines cached`);

  return sourceStatus;
}

// API: Get source status
app.get('/api/sources/status', (_req, res) => {
  res.json({
    ...sourceStatus,
    intervalMs: SOURCE_REFRESH_INTERVAL,
    headlineCount: headlinesCache.items.length,
  });
});

// API: Get cached headlines from all sources
app.get('/api/sources/headlines', (req, res) => {
  const source = req.query.source; // optional filter
  let items = headlinesCache.items;
  if (source) items = items.filter(i => i.source.toLowerCase().includes(source.toLowerCase()));
  res.json({
    items,
    count: items.length,
    lastRefresh: headlinesCache.timestamp,
    cached: true,
  });
});

// API: Force manual refresh
app.post('/api/sources/refresh', async (_req, res) => {
  try {
    const status = await refreshAllSources();
    res.json({ ok: true, ...status, headlineCount: headlinesCache.items.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Auto-refresh scheduler — every 5 minutes
let refreshTimer = null;
function startRefreshScheduler() {
  // Initial refresh on boot (delayed 5s to let server start)
  setTimeout(() => {
    refreshAllSources();
  }, 5000);

  // Then every 5 minutes
  refreshTimer = setInterval(() => {
    refreshAllSources();
  }, SOURCE_REFRESH_INTERVAL);

  console.log(`[REFRESH] Macro active — all sources refresh every ${SOURCE_REFRESH_INTERVAL / 1000}s (5 min)`);
}

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
    c2Online: !!ANTHROPIC_API_KEY,
    liveuamapOnline: !!LIVEUAMAP_API_KEY,
    activeSessions: sessions.size + c2Sessions.size,
  });
});

const PORT = process.env.ULTRON_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[ULTRON] Backend API running on http://localhost:${PORT}`);
  console.log(`[ULTRON] Model: ${ULTRON_MODEL} via ${OLLAMA_URL}`);
  console.log(`[ULTRON] SOUL: ${ULTRON_SOUL ? 'loaded' : 'built-in fallback'}`);
  startRefreshScheduler();
});
