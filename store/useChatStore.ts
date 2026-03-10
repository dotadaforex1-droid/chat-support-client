import { create } from 'zustand';

interface Ticket {
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

interface Message {
    _id: string;
    ticketId: string;
    senderId: string;
    senderRole: 'customer' | 'agent';
    message: string;
    createdAt: string;
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
        const isDuplicate = state.messages.some((m) => m._id === message._id);
        if (isDuplicate) return state;
        return { messages: [...state.messages, message] };
    }),
    updateTicket: (updatedTicket) => set((state) => ({
        tickets: state.tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t),
        activeTicket: state.activeTicket?._id === updatedTicket._id ? updatedTicket : state.activeTicket
    })),
}));
