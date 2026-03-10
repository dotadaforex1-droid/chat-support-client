"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Clock, ArrowRight, Search, Filter, User, Hash } from 'lucide-react';
import Link from 'next/link';
import { socketService } from '@/lib/socket';

export default function AgentDashboard() {
    const { user, token, _hasHydrated } = useAuthStore();
    const { tickets, setTickets, updateTicket } = useChatStore();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!user || user.role !== 'agent') {
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

        // Connect socket to receive global updates
        socketService.connect(token as string);
        socketService.onTicketUpdated((updatedTicket) => {
            updateTicket(updatedTicket);
        });

        return () => {
            socketService.disconnect();
        };
    }, [user, token, setTickets, updateTicket, router]);

    return (
        <div className="min-h-screen bg-transparent pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 pt-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Agent Console
                        </h1>
                        <p className="text-muted font-medium opacity-80">
                            Real-time management for all support requests
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="crypto-glass px-6 py-4 rounded-[2rem] flex items-center gap-6 border-white/[0.04]">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted uppercase font-black tracking-[0.2em] opacity-60">Total Tickets</span>
                                <span className="text-2xl font-black text-white">{tickets.length}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-primary uppercase font-black tracking-[0.2em] opacity-80">Active</span>
                                <span className="text-2xl font-black text-primary shadow-blue-glow">
                                    {tickets.filter(t => t.status !== 'Closed').length}
                                </span>
                            </div>
                            <div className="w-[1px] h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-yellow-500 uppercase font-black tracking-[0.2em] opacity-80">Pending</span>
                                <span className="text-2xl font-black text-yellow-500">
                                    {tickets.filter(t => t.status === 'Open' || t.status === 'Pending').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters/Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 group">
                    <div className="flex-1 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Search by ID, Subject, or Customer..."
                            className="crypto-input pl-14"
                        />
                    </div>
                    <button className="crypto-glass px-8 py-4 rounded-2xl border-white/[0.05] flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/10 transition-all">
                        <Filter className="w-5 h-5 text-primary" />
                        <span>Filter</span>
                    </button>
                    <button className="crypto-button-primary px-8 rounded-2xl">
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-white/[0.03] animate-pulse rounded-3xl border border-white/[0.05]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="crypto-glass rounded-[2.5rem] overflow-hidden border-white/[0.04]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[10px] uppercase tracking-[0.25em] font-black text-muted/60">
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Ticket Details</th>
                                        <th className="px-8 py-6">Customer</th>
                                        <th className="px-8 py-6">Priority</th>
                                        <th className="px-8 py-6">Activity</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket._id}
                                            className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/agent/tickets/${ticket._id}`)}
                                        >
                                            <td className="px-8 py-7">
                                                <StatusBadge status={ticket.status} />
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-white group-hover:text-primary transition-colors text-lg">
                                                        {ticket.subject}
                                                    </span>
                                                    <span className="text-[10px] text-muted font-mono mt-1.5 flex items-center gap-1.5 opacity-60">
                                                        <Hash className="w-3 h-3 text-primary/50" />
                                                        {ticket._id.slice(-12).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white/90">
                                                            {typeof ticket.userId === 'object' ? ticket.userId.name : 'Customer'}
                                                        </span>
                                                        <span className="text-[10px] text-muted font-medium">
                                                            {typeof ticket.userId === 'object' ? ticket.userId.email : 'Verified User'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <span className={cn(
                                                    "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                                                    ticket.priority === 'High' || ticket.priority === 'Urgent'
                                                        ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                                        : "bg-white/5 text-muted border border-white/10"
                                                )}>
                                                    {ticket.priority} Priority
                                                </span>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-white/80 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-primary/60" />
                                                        {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-muted font-medium pl-6">
                                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <div className="flex items-center justify-end gap-5">
                                                    {ticket.unreadCount.agent > 0 && (
                                                        <span className="bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-blue-glow animate-pulse">
                                                            {ticket.unreadCount.agent}
                                                        </span>
                                                    )}
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
