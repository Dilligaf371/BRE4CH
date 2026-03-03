import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Shield, Wifi, WifiOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'command' | 'alert';
}

const STORAGE_KEY = 'roar-jarvis-messages';
const MAX_STORED_MESSAGES = 50;

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
  } catch { /* ignore */ }
  return [
    {
      id: '0',
      role: 'assistant',
      content: "C2 OFSEC online. Module INTEL COS connecté à BRE4CH.\n\nOperation Roaring Lion — Phase III STRIKE active.\n\nConnected to AI Gateway. Ask your questions.",
      timestamp: new Date(),
      type: 'text',
    },
  ];
}

function saveMessages(messages: Message[]) {
  try {
    const toStore = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch { /* ignore */ }
}

async function streamJarvisResponse(
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  try {
    const res = await fetch('/api/c2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: 'roar-jarvis' }),
    });

    if (!res.ok || !res.body) {
      onError(`Connection failed: ${res.status}`);
      onDone();
      return;
    }

    const reader = res.body.getReader();
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
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) onChunk(parsed.text);
            if (parsed.error) onError(parsed.error);
          } catch {
            // skip
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(`Network error: ${err instanceof Error ? err.message : 'unknown'}`);
    onDone();
  }
}

export function JarvisChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMsgRef = useRef<string>('');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isStreaming]);

  // Persist messages
  useEffect(() => { saveMessages(messages); }, [messages]);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setIsConnected(d.c2Online === true))
      .catch(() => setIsConnected(false));
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    const userInput = input.trim();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      type: userInput.startsWith('/') ? 'command' : 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    streamingMsgRef.current = '';

    const assistantId = (Date.now() + 1).toString();
    const placeholderMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, placeholderMsg]);

    streamJarvisResponse(
      userInput,
      (text) => {
        streamingMsgRef.current += text;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: streamingMsgRef.current } : m)
        );
      },
      () => {
        setIsStreaming(false);
        if (!streamingMsgRef.current) {
          setMessages(prev =>
            prev.map(m => m.id === assistantId
              ? { ...m, content: 'Connection to C2 backend lost. Verify API key and server status.' }
              : m
            )
          );
        }
      },
      (err) => {
        console.error('[C2]', err);
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: `[ERROR] ${err}` }
            : m
          )
        );
      },
    );
  }, [input, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--palantir-border)] flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/20 flex items-center justify-center border border-blue-500/40">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-blue-400">C2</span>
            <span className="text-[10px] text-[var(--palantir-text-muted)] font-mono">OFSEC // INTEL COS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">BRE4CH // RFA ANALYSIS</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
          isConnected === true
            ? 'bg-green-500/10 border-green-500/30'
            : isConnected === false
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          {isConnected === true ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : isConnected === false ? (
            <WifiOff className="w-3 h-3 text-red-400" />
          ) : (
            <Wifi className="w-3 h-3 text-yellow-400 animate-pulse" />
          )}
          <div className={`w-1.5 h-1.5 rounded-full ${
            isConnected === true ? 'bg-green-500 animate-pulse' : isConnected === false ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <span className={`text-[10px] font-mono ${
            isConnected === true ? 'text-green-400' : isConnected === false ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {isConnected === true ? 'CONNECTED' : isConnected === false ? 'OFFLINE' : 'CONNECTING'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-indigo-500/20 border border-indigo-500/30'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Shield className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className={`flex-1 max-w-[88%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-3 py-2 rounded-lg text-xs leading-relaxed ${
                msg.role === 'user'
                  ? msg.type === 'command'
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100 font-mono'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-100'
                  : 'bg-black/40 border border-[var(--palantir-border)] text-[var(--palantir-text)]'
              }`}>
                <pre className="whitespace-pre-wrap font-[inherit] m-0">{msg.content || '\u00A0'}</pre>
              </div>
              <div className={`text-[9px] text-[var(--palantir-text-muted)] mt-0.5 font-mono ${
                msg.role === 'user' ? 'text-right' : ''
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[9px] font-mono text-blue-400/60">C2 processing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[var(--palantir-border)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask C2..."
            disabled={isStreaming}
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-[var(--palantir-border)] text-xs text-[var(--palantir-text)] placeholder:text-[var(--palantir-text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 font-mono disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
