"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { Plus, MessageSquare, Clock, ArrowRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboard() {
    const { user, token, _hasHydrated } = useAuthStore();
    const { tickets, setTickets } = useChatStore();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!user || user.role !== 'customer') {
            router.push('/login');
            return;
        }

        const fetchTickets = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setTickets(data);
            } catch (err) {
                console.error('Failed to fetch tickets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [user, token, setTickets, router]);

    return (
        <div className="min-h-screen bg-transparent pb-12">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-12">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent text-center md:text-left">
                            Support Tickets
                        </h1>
                        <p className="text-sm md:text-base text-muted font-medium opacity-80 text-center md:text-left">
                            Manage your inquiries and chat with our agents
                        </p>
                    </div>

                    <Link
                        href="/dashboard/tickets/new"
                        className="crypto-button-primary px-6 md:px-8 py-4 md:py-5 text-base md:text-lg self-center md:self-end group w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Support Ticket</span>
                    </Link>
                </div>

                {/* Filters/Search */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8 md:mb-10 group">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Search your tickets..."
                            className="crypto-input pl-12 md:pl-14 py-3 md:py-4 text-sm md:text-base"
                        />
                    </div>
                    <button className="crypto-glass px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-white/[0.05] flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm font-black uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/10 transition-all">
                        <Filter className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        <span>Filter</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/[0.03] animate-pulse rounded-[2rem] border border-white/[0.05]"></div>
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="crypto-glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center border-white/[0.04] animate-fade-in">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-2xl md:rounded-[2.5rem] border border-primary/20 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-blue-glow">
                            <MessageSquare className="w-8 h-8 md:w-12 md:h-12 text-primary/60" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3">No active tickets</h3>
                        <p className="text-sm md:text-base text-muted mb-8 md:mb-10 max-w-sm mx-auto font-medium">Start a conversation with our elite support team by creating your first ticket.</p>
                        <Link
                            href="/dashboard/tickets/new"
                            className="crypto-button-primary inline-flex px-8 md:px-10 py-3 md:py-4"
                        >
                            Open A Ticket
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tickets.map((ticket, index) => (
                            <Link
                                key={ticket._id}
                                href={`/dashboard/tickets/${ticket._id}`}
                                className="crypto-glass p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/[0.04] hover:border-primary/30 hover:bg-white/[0.05] transition-all group relative overflow-hidden animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Subtle highlight on hover */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <StatusBadge status={ticket.status} />
                                            <div className="h-4 w-[1px] bg-white/10" />
                                            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em] opacity-60">
                                                {ticket.category}
                                            </span>
                                            <span className="text-[10px] text-primary/60 font-mono tracking-widest">
                                                ID: {ticket._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-lg md:text-xl font-black group-hover:text-primary transition-colors line-clamp-1">
                                                {ticket.subject}
                                            </h3>
                                            <p className="text-xs md:text-sm text-muted font-medium line-clamp-1 opacity-70">
                                                {ticket.lastMessage || "No messages yet"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                        <div className="flex items-center gap-2 text-[12px] font-bold text-muted">
                                            <Clock className="w-4 h-4 text-primary/50" />
                                            {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {ticket.unreadCount.customer > 0 && (
                                                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-blue-glow animate-pulse">
                                                    {ticket.unreadCount.customer} NEW
                                                </span>
                                            )}
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
