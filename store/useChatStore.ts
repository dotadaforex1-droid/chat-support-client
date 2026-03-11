import { create } from 'zustand';

export interface Ticket {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    } | string;
    subject: string;
    category: string;
    status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
    priority: string;
    lastMessage: string;
    unreadCount: { customer: number; agent: number };
    updatedAt: string;
}

export interface Message {
    _id: string;
    ticketId: string;
    senderId: string;
    senderRole: 'customer' | 'agent';
    message: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'error';
    tempId?: string;
}

interface ChatState {
    tickets: Ticket[];
    activeTicket: Ticket | null;
    messages: Message[];
    setTickets: (tickets: Ticket[]) => void;
    setActiveTicket: (ticket: Ticket | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateTicket: (ticket: Ticket) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    tickets: [],
    activeTicket: null,
    messages: [],
    setTickets: (tickets) => set({ tickets }),
    setActiveTicket: (ticket) => set({ activeTicket: ticket }),
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => {
        // 1. Check for tempId match (Reliable for optimistic updates)
        if (message.tempId) {
            const optimisticIdx = state.messages.findIndex(m => m._id === message.tempId || m.tempId === message.tempId);
            if (optimisticIdx !== -1) {
                const newMessages = [...state.messages];
                newMessages[optimisticIdx] = { ...message, status: 'sent' };
                return { messages: newMessages };
            }
        }

        // 2. Fallback content match (In case tempId was lost or for cross-tab sync)
        const contentMatchIdx = state.messages.findIndex(m =>
            m.status === 'sending' &&
            m.message === message.message &&
            String(m.senderId) === String(message.senderId)
        );

        if (contentMatchIdx !== -1) {
            const newMessages = [...state.messages];
            newMessages[contentMatchIdx] = { ...message, status: 'sent' };
            return { messages: newMessages };
        }

        // 3. Regular deduplication via server ID
        const isDuplicate = state.messages.some((m) => m._id === message._id);
        if (isDuplicate) return state;

        return { messages: [...state.messages, { ...message, status: 'sent' }] };
    }),


    updateTicket: (updatedTicket) => set((state) => ({
        tickets: state.tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t),
        activeTicket: state.activeTicket?._id === updatedTicket._id ? updatedTicket : state.activeTicket
    })),
}));
