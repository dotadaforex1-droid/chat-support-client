import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket: Socket | null = null;

    connect(token: string) {
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinTicket(ticketId: string) {
        this.socket?.emit('join_ticket', { ticketId });
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
