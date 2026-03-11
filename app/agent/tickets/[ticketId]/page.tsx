"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useParams, useRouter } from 'next/navigation';
import { socketService } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import MessageBubble from '@/components/MessageBubble';
import StatusBadge from '@/components/StatusBadge';
import { Send, ChevronLeft, Loader2, Info, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils';

export default function AgentChatPage() {
    const params = useParams();
    const ticketId = params?.ticketId as string;
    const { user, token, _hasHydrated } = useAuthStore();
    const { activeTicket, setActiveTicket, messages, setMessages, addMessage } = useChatStore();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!user || user.role !== 'agent') {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Ticket
                const ticketRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ticketData = await ticketRes.json();
                setActiveTicket(ticketData);

                // Fetch Messages
                const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${ticketId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const msgData = await msgRes.json();
                setMessages(msgData);

                // Connect Socket
                socketService.connect(token as string);
                socketService.joinTicket(ticketId as string);

                socketService.onMessageReceived((msg) => {
                    addMessage(msg);
                });

                socketService.onTyping((data) => {
                    // Only show typing if it's NOT the current agent (using ID)
                    if (data.isTyping && data.userId !== user?._id) {
                        setTyping(data.senderRole === 'customer' ? 'Customer' : data.userName);
                    } else {
                        setTyping(null);
                    }
                });

            } catch (err) {
                console.error('Failed to load chat:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            socketService.disconnect();
        };
    }, [ticketId, token, user, setActiveTicket, setMessages, addMessage, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, typing]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const msgData = {
            ticketId,
            senderId: user?._id,
            senderRole: user?.role,
            message: input,
            tempId: `agent-${Date.now()}` // Allow agent to also have tempId handshake
        };

        socketService.sendMessage(msgData);
        socketService.emitTyping({
            ticketId,
            userId: user?._id,
            userName: user?.name,
            senderRole: user?.role,
            isTyping: false
        });
        setInput('');
    };


    const updateStatus = async (status: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            setActiveTicket(data);
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto px-4 md:px-6 md:py-6 md:pb-12 h-[calc(100vh-5rem)] box-border">

                {/* Left Sidebar - Ticket Details */}
                <aside className="w-80 crypto-glass border-y-0 border-l-0 rounded-l-[2.5rem] hidden lg:flex flex-col p-8 overflow-y-auto">
                    <Link href="/agent" className="inline-flex items-center gap-2 text-muted font-bold hover:text-primary transition-all mb-10 group text-xs uppercase tracking-widest">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span>Dashboard</span>
                    </Link>

                    <div className="mb-10">
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted font-black mb-6 opacity-60">Customer Profile</h3>
                        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] flex items-center gap-4 group hover:bg-white/[0.05] transition-all">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-blue-glow">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-white">
                                    {typeof activeTicket?.userId === 'object' ? activeTicket.userId.name : 'Customer'}
                                </p>
                                <p className="text-[10px] text-muted font-bold opacity-60">
                                    {typeof activeTicket?.userId === 'object' ? activeTicket.userId.email : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted font-black mb-6 opacity-60">Management</h3>
                        <div className="grid gap-3">
                            <button
                                onClick={() => updateStatus('Pending')}
                                disabled={updating || activeTicket?.status === 'Pending'}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                                    activeTicket?.status === 'Pending'
                                        ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                        : "bg-white/[0.03] border-white/[0.05] text-muted hover:border-yellow-500/30 hover:text-yellow-500"
                                )}
                            >
                                <Clock className="w-4 h-4" />
                                <span>Set Pending</span>
                            </button>
                            <button
                                onClick={() => updateStatus('Resolved')}
                                disabled={updating || activeTicket?.status === 'Resolved'}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                                    activeTicket?.status === 'Resolved'
                                        ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(0,211,149,0.1)]"
                                        : "bg-white/[0.03] border-white/[0.05] text-muted hover:border-accent/30 hover:text-accent"
                                )}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark Resolved</span>
                            </button>
                            <button
                                onClick={() => updateStatus('Closed')}
                                disabled={updating || activeTicket?.status === 'Closed'}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                                    activeTicket?.status === 'Closed'
                                        ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                        : "bg-white/[0.03] border-white/[0.05] text-muted hover:border-red-500/30 hover:text-red-400"
                                )}
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Close Ticket</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2 opacity-80">Security Protocol</p>
                            <p className="text-[11px] text-muted font-medium leading-relaxed opacity-70">
                                This is a secure channel. All communications are end-to-end encrypted and logged for quality assurance.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden crypto-glass border-white/[0.04] md:rounded-[2.5rem] lg:border-l-0 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    {/* Header */}
                    <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3 md:gap-5">
                            <Link href="/agent" className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:text-primary transition-all group lg:hidden">
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 md:gap-4 mb-1 md:mb-2">
                                    <h2 className="font-black text-base md:text-xl tracking-tight leading-tight text-white line-clamp-1">{activeTicket?.subject}</h2>
                                    <StatusBadge status={activeTicket?.status as any} />
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black tracking-[0.2em] text-muted opacity-60 uppercase">
                                    <span className="text-primary/80">{activeTicket?.category}</span>
                                    <span>•</span>
                                    <span className="line-clamp-1">Ticket ID: {ticketId.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8 space-y-1 md:space-y-2 scrollbar-hide scroll-smooth">
                        <div className="flex justify-center mb-8">
                            <div className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-black tracking-[0.25em] text-muted uppercase">
                                System: Ticket established
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOwn={msg.senderRole === 'agent'}
                            />
                        ))}

                        {typing && (
                            <div className="flex justify-start animate-fade-in pb-4">
                                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-[1.5rem] rounded-bl-none text-[12px] font-bold text-primary flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span className="opacity-80 tracking-wide">{typing} is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-8 border-t border-white/[0.05] bg-white/[0.01]">
                        <form onSubmit={handleSend} className="relative group/form">
                            <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] md:rounded-[2rem] blur-[2rem] opacity-0 group-focus-within/form:opacity-100 transition-opacity duration-700 -z-10" />

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    socketService.emitTyping({
                                        ticketId,
                                        userId: user?._id,
                                        userName: user?.name,
                                        senderRole: user?.role,
                                        isTyping: e.target.value.length > 0
                                    });

                                }}
                                placeholder={activeTicket?.status === 'Closed' ? "Session is closed" : "Type your reply..."}
                                disabled={activeTicket?.status === 'Closed'}
                                className="crypto-input pl-5 md:pl-8 pr-16 md:pr-20 py-4 md:py-6 text-sm md:text-base rounded-[1.5rem] md:rounded-[2rem]"
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || activeTicket?.status === 'Closed'}
                                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 bg-primary text-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-30 disabled:hover:bg-primary shadow-blue-glow group"
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
