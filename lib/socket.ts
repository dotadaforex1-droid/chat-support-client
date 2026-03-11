import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

if (!SOCKET_URL && process.env.NODE_ENV === 'production') {
    console.error('NEXT_PUBLIC_SOCKET_URL is not defined in production!');
}

type ReconnectCallback = () => void;

class SocketService {
    socket: Socket | null = null;
    activeTicketId: string | null = null;
    onReconnectCallbacks: ReconnectCallback[] = [];

    connect(token: string) {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Connected to socket server');

                // Automatically rejoin if we previously joined a room
                if (this.activeTicketId) {
                    this.joinTicket(this.activeTicketId);

                    // Trigger callbacks so UI knows to refetch missed messages
                    this.onReconnectCallbacks.forEach(cb => cb());
                }
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('Disconnected from socket server:', reason);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.activeTicketId = null;
            this.onReconnectCallbacks = [];
        }
    }

    joinTicket(ticketId: string) {
        this.activeTicketId = ticketId;
        this.socket?.emit('join_ticket', { ticketId });
    }

    onReconnect(callback: ReconnectCallback) {
        this.onReconnectCallbacks.push(callback);
    }

    removeReconnect(callback: ReconnectCallback) {
        this.onReconnectCallbacks = this.onReconnectCallbacks.filter(cb => cb !== callback);
    }

    sendMessage(data: any) {
        this.socket?.emit('send_message', data);
    }

    onMessageReceived(callback: (message: any) => void) {
        this.socket?.on('receive_message', callback);
    }

    onTicketUpdated(callback: (ticket: any) => void) {
        this.socket?.on('ticket_updated', callback);
    }

    onTyping(callback: (data: any) => void) {
        this.socket?.on('user_typing', callback);
    }

    emitTyping(data: any) {
        this.socket?.emit('typing', data);
    }
}

export const socketService = new SocketService();
