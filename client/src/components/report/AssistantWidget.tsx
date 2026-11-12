import React, { useState } from 'react';
import { AnalysisAPI } from '../../services/api.js';
import { StructuredAnalysis } from '../../types/analysis.js';
import { Bot, Send, Sparkles, User, Clock, AlertCircle } from 'lucide-react';

interface AssistantWidgetProps {
  analysis: StructuredAnalysis;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Why is this purchase rated as risky?',
  'How much will I pay after the trial ends?',
  'What return charges am I responsible for?',
  'Which fees are confirmed vs estimated?',
  'What important information did the merchant hide?',
];

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I'm your BuyCheck Shopping Intelligence Assistant. I've analyzed "${analysis.productName || 'this purchase'}" and grounded my knowledge strictly in the verified merchant terms and evidence quotes. What would you like to know before paying?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputText).trim();
    if (!q || isAsking) return;

    setError(null);
    setInputText('');
    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const answer = await AnalysisAPI.askAssistant(q, analysis, analysis._id || analysis.id);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Assistant request failed.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center text-lime">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              AI Purchase Assistant
            </h3>
            <p className="text-xs text-zinc-400">
              Ask questions grounded strictly in this report's verified facts.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            disabled={isAsking}
            className="text-[11px] px-2.5 py-1 rounded-full bg-surface border border-borderMuted hover:border-lime/40 text-zinc-300 hover:text-ivory transition-all text-left"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 bg-graphite/50 p-4 rounded-xl border border-borderSubtle">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 text-xs ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-charcoal border border-lime/30 flex items-center justify-center text-lime shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-lime text-graphite font-medium rounded-tr-none'
                  : 'bg-surface border border-borderMuted text-zinc-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              <div
                className={`text-[9px] mt-1 font-mono ${
                  m.sender === 'user' ? 'text-graphite/70' : 'text-zinc-500'
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-md bg-surface border border-borderMuted flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isAsking && (
          <div className="flex items-center gap-2 text-xs text-lime font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting verified report evidence...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything about this purchase..."
          className="flex-1 bg-graphite rounded-xl border border-borderMuted px-4 py-2.5 text-xs text-ivory placeholder-zinc-500 focus:outline-none focus:border-lime"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isAsking}
          className="p-2.5 rounded-xl bg-lime hover:bg-lime-hover disabled:opacity-40 text-graphite font-bold transition-all tactile-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
