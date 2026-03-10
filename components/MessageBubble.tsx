import { cn, formatDate } from '@/utils';

interface Message {
    _id: string;
    senderRole: 'customer' | 'agent';
    message: string;
    createdAt: string;
}

export default function MessageBubble({
    message,
    isOwn
}: {
    message: Message,
    isOwn: boolean
}) {
    return (
        <div className={cn(
            "flex w-full mb-6 animate-fade-in group",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[80%] md:max-w-[70%] px-5 py-4 rounded-[1.8rem] relative transition-all duration-300",
                isOwn
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 text-white border border-primary/20 rounded-br-none shadow-blue-glow"
                    : "crypto-glass text-white/90 rounded-bl-none border-white/[0.08]"
            )}>
                {/* Status Dot for other's messages */}
                {!isOwn && (
                    <div className="absolute -left-10 bottom-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                )}

                <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap tracking-wide">
                    {message.message}
                </p>

                <div className={cn(
                    "text-[10px] mt-2 font-bold tracking-widest uppercase opacity-40 flex items-center gap-2",
                    isOwn ? "justify-end" : "justify-start"
                )}>
                    {formatDate(message.createdAt)}
                    {isOwn && (
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                    )}
                </div>
            </div>
        </div>
    );
}
