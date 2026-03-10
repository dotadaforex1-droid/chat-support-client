"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import Link from 'next/link';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user, setAuth, _hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (_hasHydrated && user) {
            router.push(user.role === 'agent' ? '/agent' : '/dashboard');
        }
    }, [_hasHydrated, user, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setAuth(data.user, data.token);
            router.push(data.user.role === 'agent' ? '/agent' : '/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 flex items-center justify-center mb-6 animate-float">
                        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain shadow-blue-glow rounded-[2.5rem]" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-muted text-center font-medium opacity-80">
                        Join our elite support ecosystem
                    </p>
                </div>

                <div className="crypto-glass p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                    <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Full Name
                            </label>
                            <div className="relative group/input">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within/input:text-primary" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="crypto-input pl-14"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Email Address
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within/input:text-primary" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="crypto-input pl-14"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Password
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within/input:text-primary" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="crypto-input pl-14"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1 text-white/70 tracking-wider uppercase">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('customer')}
                                    className={cn(
                                        "py-4 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1",
                                        role === 'customer'
                                            ? "bg-primary/20 border-primary text-primary shadow-blue-glow"
                                            : "bg-white/[0.03] border-white/[0.08] text-muted hover:border-primary/50"
                                    )}
                                >
                                    <span>Customer</span>
                                    <span className="text-[10px] opacity-60 font-medium">Standard User</span>
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className={cn(
                                        "py-4 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 cursor-not-allowed opacity-40 grayscale",
                                        "bg-white/[0.03] border-white/[0.08] text-muted"
                                    )}
                                >
                                    <span>Support Agent</span>
                                    <span className="text-[10px] opacity-60 font-medium">Restricted Access</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="crypto-button-primary w-full text-lg py-5 mt-4"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    <span>Get Started Now</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm text-muted font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-bold hover:text-primary-light transition-all underline-offset-4 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
