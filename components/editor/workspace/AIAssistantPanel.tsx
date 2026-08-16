'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

interface AIAssistantPanelProps {
  hasImage: boolean;
  imageUrl?: string;
  onApplyText: (text: string) => void;
}

const QUICK_ACTIONS = [
  { label: 'Enhance colors', prompt: 'Recommend exact color adjustments to make this image pop with cinematic vibrancy.' },
  { label: 'Fix exposure', prompt: 'Analyze this image and recommend exact exposure, brightness, and contrast values.' },
  { label: 'Suggest filter', prompt: 'Which preset filter (Enhance, Cinematic, Neon, Dream, Noir) fits this image best and why?' },
  { label: 'Write caption', prompt: 'Write a short cinematic caption for this image.' },
];

const UNAVAILABLE_MESSAGE =
  'AI feature unavailable — check configuration. Add your Gemini API key to the server environment and restart to enable the assistant.';

export default function AIAssistantPanel({
  hasImage,
  imageUrl,
  onApplyText,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I can analyze your image and suggest adjustments. Try a quick action below, or describe what you want to do.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const runPrompt = async (prompt: string) => {
    if (isThinking || !prompt.trim()) return;

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: prompt };
    const pendingMsg: Message = { id: `${Date.now()}-a`, role: 'assistant', content: '', pending: true };
    setMessages(prev => [...prev, userMsg, pendingMsg]);
    setIsThinking(true);
    setSuggestion(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image: imageUrl }),
      });

      const data = await res.json().catch(() => null);

      let content: string;
      if (res.ok && data?.content) {
        content = data.content;
      } else {
        content = data?.error || UNAVAILABLE_MESSAGE;
      }

      const textMatch = content.match(/\[TEXT\]\s*([\s\S]*)/);
      if (textMatch) {
        setSuggestion(textMatch[1].trim());
        content = content.replace(/\[TEXT\][\s\S]*/, '');
      }

      setMessages(prev => prev.map(m => (m.id === pendingMsg.id ? { ...m, content, pending: false } : m)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setMessages(prev => prev.map(m => (m.id === pendingMsg.id ? { ...m, content: `⚠️ ${message}`, pending: false } : m)));
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    const prompt = input.trim();
    if (!prompt) return;
    setInput('');
    runPrompt(prompt);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-glowViolet to-glowCyan flex items-center justify-center text-[10px] font-bold shadow-[0_0_12px_rgba(123,92,255,0.4)]">
            ✦
          </div>
          <div>
            <p className="text-xs font-heading font-bold text-textPrimary uppercase tracking-wider">Nebula AI</p>
            <p className="text-[9px] text-textMuted">Gemini · {hasImage ? 'analyzing image context' : 'no image loaded'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => runPrompt(action.prompt)}
              disabled={isThinking || !hasImage}
              className="px-2 py-1 rounded-lg text-[9px] font-heading uppercase tracking-wider bg-white/5 border border-white/10 text-textMuted hover:text-white hover:border-glowCyan/50 hover:bg-glowCyan/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'self-end bg-gradient-to-r from-glowViolet/30 to-glowCyan/25 border border-glowCyan/30 text-textPrimary rounded-br-sm'
                  : 'self-start bg-white/5 border border-white/10 text-textMuted rounded-bl-sm'
              }`}
            >
              {msg.pending ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-glowCyan animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-glowViolet animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-glowMagenta animate-pulse [animation-delay:300ms]" />
                  <span className="ml-1 text-textMuted/70">Gemini thinking...</span>
                </span>
              ) : (
                msg.content
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {suggestion && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-glowMint/10 border border-glowMint/40">
            <span className="text-[10px] text-glowMint truncate flex-1">{suggestion}</span>
            <button
              onClick={() => {
                onApplyText(suggestion);
                setSuggestion(null);
              }}
              className="px-2.5 py-1 rounded-lg text-[9px] font-heading font-bold uppercase tracking-wider bg-glowMint text-[#05050A] hover:brightness-110 transition-all shrink-0"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 focus-within:border-glowCyan/50 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={hasImage ? 'Ask Nebula AI...' : 'Upload an image first'}
            disabled={!hasImage}
            className="flex-1 bg-transparent text-xs text-textPrimary placeholder:text-textMuted/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !hasImage || !input.trim()}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-glowViolet to-glowCyan text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}