import { cn } from '@/utils';

const STATUS_COLORS = {
    Open: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(17,153,250,0.1)]",
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
    Resolved: "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(0,211,149,0.1)]",
    Closed: "bg-white/5 text-white/40 border-white/10",
};

export default function StatusBadge({ status }: { status: keyof typeof STATUS_COLORS }) {
    return (
        <span className={cn(
            "text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-widest flex items-center gap-1.5 w-fit",
            STATUS_COLORS[status] || STATUS_COLORS.Open
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                status === 'Open' ? "bg-primary" :
                    status === 'Pending' ? "bg-yellow-500" :
                        status === 'Resolved' ? "bg-accent" : "bg-white/20"
            )} />
            {status}
        </span>
    );
}
