'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';
import { AppData } from '@/lib/types';

type Plan = 'free' | 'professional' | 'enterprise';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const SUGGESTED_QUESTIONS = [
    'Is this location safe to build a mall?',
    'What plants should I use to reduce heat?',
    'When is the peak heat hour here?',
    'How will temperatures change in 5 years?',
];

export default function ChatBot({ data, plan }: { data: AppData; plan: Plan }) {
    if (plan !== 'enterprise') {
        return null;
    }

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm your HeatWatch AI assistant for ${data.location.city}, ${data.location.country}. I have access to your full heat analysis. Ask me anything about urban planning, construction, vegetation, or heat risk!`,
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msg = text ?? input.trim();
        if (!msg || loading) return;

        const userMessage: Message = { role: 'user', content: msg };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, data, plan, history: messages }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to get response');
            setMessages((prev) => [...prev, { role: 'assistant', content: json.reply }]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const panelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '400px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d0d',
        borderLeft: '1px solid #2a2a2a',
        boxShadow: '-12px 0 48px rgba(0,0,0,0.7)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: open ? 'all' : 'none',
    };

    return (
        <>
            {/* Floating Bubble — big and impressive */}
            {!open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '28px',
                        right: '28px',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                    }}
                    onClick={() => setOpen(true)}
                >
                    {/* Label */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ff6b35, #c41e3a)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        letterSpacing: '0.05em',
                        boxShadow: '0 2px 12px rgba(255,107,53,0.4)',
                        whiteSpace: 'nowrap',
                        animation: 'float 3s ease-in-out infinite',
                    }}>
                        🔥 Ask AI Planner
                    </div>

                    {/* Main bubble */}
                    <div
                        style={{
                            position: 'relative',
                            width: '88px',
                            height: '88px',
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget.querySelector('.bubble-img') as HTMLElement;
                            if (el) el.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget.querySelector('.bubble-img') as HTMLElement;
                            if (el) el.style.transform = 'scale(1)';
                        }}
                    >
                        {/* Pulse rings */}
                        <span style={{
                            position: 'absolute',
                            inset: '-8px',
                            borderRadius: '50%',
                            border: '2.5px solid rgba(255,107,53,0.35)',
                            animation: 'pulse-ring 2s ease-out infinite',
                        }} />
                        <span style={{
                            position: 'absolute',
                            inset: '-16px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,107,53,0.2)',
                            animation: 'pulse-ring 2s ease-out 0.5s infinite',
                        }} />

                        {/* Image */}
                        <div className="bubble-img" style={{
                            width: '88px',
                            height: '88px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid #ff6b35',
                            boxShadow: '0 6px 30px rgba(255,107,53,0.55), 0 0 0 6px rgba(255,107,53,0.12)',
                            background: '#ff6b35',
                            transition: 'transform 0.2s ease',
                        }}>
                            <img
                                src="/image.png"
                                alt="HeatWatch AI"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center top',
                                    display: 'block',
                                }}
                            />
                        </div>

                        {/* Online dot */}
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            border: '2.5px solid #0d0d0d',
                            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                        }} />
                    </div>
                </div>
            )}

            {/* Slide-in Side Panel */}
            <div style={panelStyle}>

                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #ff6b35 0%, #c41e3a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.5)',
                            flexShrink: 0,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                        }}>
                            <img
                                src="/image.png"
                                alt="AI"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                            />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: 'white', letterSpacing: '0.01em' }}>
                                HeatWatch AI
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                                    {data.location.city} · {plan} plan · Online
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                    >
                        <X size={18} color="white" />
                    </button>
                </div>

                {/* Context bar */}
                <div style={{
                    padding: '8px 20px',
                    background: '#161616',
                    borderBottom: '1px solid #222',
                    fontSize: '11px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                }}>
                    <span style={{ color: '#ff6b35' }}>●</span>
                    <span>Analyzing: <span style={{ color: '#aaa' }}>{data.location.city}, {data.location.country}</span></span>
                    {data.mlScore && (
                        <>
                            <span style={{ color: '#333' }}>·</span>
                            <span>Risk: <span style={{ color: data.mlScore.riskLevel === 'High' ? '#ef4444' : data.mlScore.riskLevel === 'Medium' ? '#f97316' : '#22c55e' }}>{data.mlScore.riskLevel}</span></span>
                        </>
                    )}
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    overflow: 'hidden', border: '1.5px solid #ff6b35', flexShrink: 0,
                                }}>
                                    <img src="/image.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '78%',
                                padding: '11px 15px',
                                borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #ff6b35, #c41e3a)'
                                    : '#1a1a1a',
                                border: msg.role === 'assistant' ? '1px solid #272727' : 'none',
                                color: 'white',
                                fontSize: '13px',
                                lineHeight: '1.65',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                boxShadow: msg.role === 'user' ? '0 2px 12px rgba(255,107,53,0.3)' : 'none',
                            }}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: '#1e1e1e', border: '1px solid #333',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <User size={14} color="#888" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #ff6b35', flexShrink: 0 }}>
                                <img src="/image.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                            </div>
                            <div style={{
                                padding: '13px 18px', borderRadius: '20px 20px 20px 5px',
                                background: '#1a1a1a', border: '1px solid #272727',
                                display: 'flex', gap: '5px', alignItems: 'center',
                            }}>
                                {[0, 1, 2].map(i => (
                                    <span key={i} style={{
                                        width: '7px', height: '7px', borderRadius: '50%',
                                        background: '#ff6b35',
                                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        display: 'inline-block',
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.length === 1 && (
                        <div style={{ marginTop: '4px' }}>
                            <p style={{ fontSize: '11px', color: '#555', textAlign: 'center', margin: '0 0 10px' }}>
                                Suggested questions
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        style={{
                                            textAlign: 'left', fontSize: '12px',
                                            padding: '9px 14px', borderRadius: '14px',
                                            border: '1px solid #252525', background: '#161616',
                                            color: '#bbb', cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff6b35';
                                            (e.currentTarget as HTMLButtonElement).style.color = '#ff6b35';
                                            (e.currentTarget as HTMLButtonElement).style.background = '#1e1010';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = '#252525';
                                            (e.currentTarget as HTMLButtonElement).style.color = '#bbb';
                                            (e.currentTarget as HTMLButtonElement).style.background = '#161616';
                                        }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding: '14px 16px',
                    borderTop: '1px solid #1e1e1e',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: '#0d0d0d',
                    flexShrink: 0,
                }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask about heat, planning, plants..."
                        style={{
                            flex: 1, background: '#1a1a1a',
                            border: '1px solid #2a2a2a', borderRadius: '24px',
                            padding: '11px 18px', fontSize: '13px',
                            color: 'white', outline: 'none', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#ff6b35')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            background: input.trim() && !loading
                                ? 'linear-gradient(135deg, #ff6b35, #c41e3a)'
                                : '#1e1e1e',
                            border: '1px solid #2a2a2a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                            flexShrink: 0, transition: 'all 0.2s',
                            boxShadow: input.trim() && !loading ? '0 2px 12px rgba(255,107,53,0.4)' : 'none',
                        }}
                    >
                        <Send size={16} color="white" />
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 9998,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-7px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </>
    );
}