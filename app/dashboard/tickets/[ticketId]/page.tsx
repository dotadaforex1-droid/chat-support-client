"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore, Message } from '@/store/useChatStore';
import { useParams, useRouter } from 'next/navigation';
import { socketService } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import MessageBubble from '@/components/MessageBubble';
import StatusBadge from '@/components/StatusBadge';
import { Send, ChevronLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const params = useParams();
    const ticketId = params?.ticketId as string;
    const { user, token, _hasHydrated } = useAuthStore();
    const { activeTicket, setActiveTicket, messages, setMessages, addMessage } = useChatStore();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const fetchMessages = async () => {
            try {
                const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${ticketId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const msgData = await msgRes.json();
                setMessages(msgData);
            } catch (err) {
                console.error('Failed to load messages:', err);
            }
        };

        const fetchData = async () => {
            try {
                // Fetch Ticket
                const ticketRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ticketData = await ticketRes.json();
                setActiveTicket(ticketData);

                await fetchMessages();

                // Connect Socket
                socketService.connect(token as string);
                socketService.joinTicket(ticketId as string);

                socketService.onMessageReceived((msg) => {
                    addMessage(msg);
                });

                socketService.onTyping((data) => {
                    // Only show typing if it's NOT the current user (using ID for reliability)
                    if (data.isTyping && data.userId !== user?._id) {
                        setTyping(data.senderRole === 'agent' ? 'Agent' : data.userName);
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

        // Refetch messages when the socket reconnects (e.g. waking phone from sleep)
        const handleReconnect = () => {
            console.log("Socket reconnected, fetching missed messages...");
            fetchMessages();
        };
        socketService.onReconnect(handleReconnect);

        // Refetch if the browser tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log("Tab became visible, fetching missed messages...");
                fetchMessages();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            socketService.removeReconnect(handleReconnect);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socketService.disconnect();
        };
    }, [ticketId, token, user, setActiveTicket, setMessages, addMessage, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, typing]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const tempMessage: Message = {
            _id: `temp-${Date.now()}`,
            ticketId,
            senderId: user?._id as string,
            senderRole: user?.role as 'customer' | 'agent',
            message: input,
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        // Add to UI immediately
        addMessage(tempMessage);
        const currentInput = input;
        setInput('');

        const msgData = {
            ticketId,
            senderId: user?._id,
            senderRole: user?.role,
            message: currentInput,
            tempId: tempMessage._id // Essential for deduplication
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


    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        socketService.emitTyping({
            ticketId,
            userId: user?._id,
            userName: user?.name,
            senderRole: user?.role,
            isTyping: e.target.value.length > 0
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full px-4 md:px-6 md:pt-6 md:pb-12 box-border">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col crypto-glass md:rounded-[2.5rem] border-white/[0.04] overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    {/* Header */}
                    <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3 md:gap-5">
                            <Link href="/dashboard" className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:text-primary transition-all group lg:hidden">
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <div>
                                <h2 className="font-black text-base md:text-xl tracking-tight leading-tight text-white mb-1 md:mb-2 line-clamp-1">
                                    {activeTicket?.subject}
                                </h2>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <StatusBadge status={activeTicket?.status as any} />
                                    <div className="h-3 w-[1px] bg-white/10" />
                                    <span className="text-[9px] md:text-[10px] text-muted font-black tracking-[0.1em] opacity-60">
                                        ID: {ticketId?.slice(-12).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-muted hover:text-primary transition-all group">
                            <Info className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8 space-y-1 md:space-y-2 scrollbar-hide scroll-smooth">
                        <div className="flex justify-center mb-8">
                            <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-black tracking-widest text-muted uppercase">
                                Beginning of support session
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOwn={msg.senderId === user?._id}
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
                                onChange={handleTyping}
                                placeholder={activeTicket?.status === 'Closed' ? "This ticket is closed" : "Type your message..."}
                                disabled={activeTicket?.status === 'Closed' || activeTicket?.status === 'Resolved'}
                                className="crypto-input pl-5 md:pl-8 pr-16 md:pr-20 py-4 md:py-6 text-sm md:text-base rounded-[1.5rem] md:rounded-[2rem]"
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || activeTicket?.status === 'Closed' || activeTicket?.status === 'Resolved'}
                                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 bg-primary text-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-30 disabled:hover:bg-primary shadow-blue-glow group"
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>

                        {(activeTicket?.status === 'Closed' || activeTicket?.status === 'Resolved') && (
                            <p className="text-center text-[10px] text-red-400 font-black mt-4 uppercase tracking-[0.2em] opacity-80 animate-pulse">
                                session has been {activeTicket.status.toLowerCase()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
