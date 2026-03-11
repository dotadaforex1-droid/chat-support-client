"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { MessageSquare, Send, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Technical');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, token, _hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!user || user.role !== 'customer') {
            router.push('/login');
        }
    }, [_hasHydrated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, category, message }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create ticket');

            router.push(`/dashboard/tickets/${data.ticket._id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-12">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted font-bold hover:text-primary transition-all mb-8 md:mb-10 group">
                    <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="text-sm md:text-base">Back to Dashboard</span>
                </Link>

                <div className="mb-8 md:mb-12 space-y-1 md:space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Create New Ticket
                    </h1>
                    <p className="text-sm md:text-base text-muted font-medium opacity-80 max-w-lg">
                        Tell us about your issue and our elite support team will get back to you as soon as possible.
                    </p>
                </div>

                <div className="crypto-glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-white/[0.04] relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Ticket Subject
                            </label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="crypto-input"
                                placeholder="e.g., Cannot access my API keys"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="crypto-input appearance-none cursor-pointer pr-14"
                                >
                                    <option value="Technical" className="bg-surface text-white">Technical Support</option>
                                    <option value="Billing" className="bg-surface text-white">Billing & Payments</option>
                                    <option value="General" className="bg-surface text-white">General Inquiry</option>
                                    <option value="Security" className="bg-surface text-white">Security Issue</option>
                                    <option value="Feedback" className="bg-surface text-white">Feedback</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Detailed Description
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="crypto-input min-h-[160px] py-5 resize-none"
                                placeholder="Describe your issue in detail so we can help you better..."
                            />
                        </div>

                        <div className="pt-2 md:pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="crypto-button-primary w-full text-base md:text-lg py-4 md:py-5 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (
                                    <>
                                        <span>Submit Ticket</span>
                                        <Send className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
