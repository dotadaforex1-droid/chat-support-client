import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <nav className="h-20 crypto-glass border-x-0 border-t-0 flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tight leading-tight">
                        Crypto<span className="text-primary">.com</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted opacity-80 leading-tight">
                        Support Center
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.05] transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/90">{user.name}</span>
                        <span className="text-[10px] uppercase font-black text-primary/80 tracking-widest leading-none">
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="w-[1px] h-8 bg-white/[0.08]" />

                <button
                    onClick={handleLogout}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all group"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </nav>
    );
}
