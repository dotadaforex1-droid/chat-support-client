import { cn, formatDate } from '@/utils';

interface Message {
    _id: string;
    senderRole: 'customer' | 'agent';
    message: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'error';
    tempId?: string;
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
            isOwn ? "justify-end" : "justify-start items-end gap-2 md:gap-3"
        )}>
            {/* Status Dot for other's messages - using Flex instead of position: absolute to fix spacing */}
            {!isOwn && (
                <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative translate-y-1">
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/80 animate-pulse" />
                </div>
            )}

            <div className={cn(
                "max-w-[80%] md:max-w-[70%] px-4 md:px-5 py-3 md:py-4 rounded-[1.5rem] md:rounded-[1.8rem] transition-all duration-300",
                isOwn
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 text-white border border-primary/20 rounded-br-none shadow-blue-glow"
                    : "crypto-glass text-white/90 rounded-bl-none border-white/[0.08]"
            )}>
                <p className="text-[14px] md:text-[15px] font-medium leading-relaxed whitespace-pre-wrap tracking-wide">
                    {message.message}
                </p>

                <div className={cn(
                    "text-[9px] md:text-[10px] mt-2 font-bold tracking-widest uppercase opacity-40 flex items-center gap-2",
                    isOwn ? "justify-end" : "justify-start"
                )}>
                    {formatDate(message.createdAt)}
                    {isOwn && (
                        <div className={cn(
                            "w-1 h-1 rounded-full",
                            message.status === 'sending' ? "bg-white/40 animate-pulse" : "bg-primary/40"
                        )} />
                    )}
                </div>
            </div>
        </div>
    );
}
