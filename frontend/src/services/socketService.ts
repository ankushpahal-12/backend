import io, { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  connect(requestId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const auth: Record<string, any> = {};
      
      if (requestId) {
        auth.requestId = requestId;
      } else {
        const token = localStorage.getItem('authToken') || 
                      document.cookie.split(';').find(c => c.trim().startsWith('jwt='))?.split('=')[1];
        if (token) {
          auth.token = token;
        }
      }

      this.socket = io(this.url, {
        auth,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit loader progress
  emitLoaderProgress(loaderKey: string, data: {
    progress: number;
    message?: string;
    subMessage?: string;
    status?: 'loading' | 'processing' | 'submitting' | 'success' | 'error';
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('loader:update', { loaderKey, ...data });
    }
  }

  // Listen to loader updates
  onLoaderUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('loader:progress', callback);
    }
  }

  // Remove loader update listener
  offLoaderUpdate(): void {
    if (this.socket) {
      this.socket.off('loader:progress');
    }
  }

  // Emit website processing status
  emitWebsiteStatus(status: {
    isProcessing: boolean;
    message?: string;
    progress?: number;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('website:status', status);
    }
  }

  // Listen to website processing status updates
  onWebsiteStatus(callback: (status: any) => void): void {
    if (this.socket) {
      this.socket.on('website:status:update', callback);
    }
  }

  // Remove website status listener
  offWebsiteStatus(): void {
    if (this.socket) {
      this.socket.off('website:status:update');
    }
  }

  // Listen to any custom event
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Emit any custom event
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Remove listener
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
