import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import os from 'os';
import config from './config/config.js';
import User from './models/User.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: config.frontendUrl,
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    // Authenticate socket connection or allow public tracking via requestId
    io.use(async (socket, next) => {
        try {
            const { token: authHeaderToken, requestId } = socket.handshake.auth || {};
            const authHeader = socket.handshake.headers.authorization;

            // Read cookie from handshake headers (sent when frontend uses withCredentials: true)
            const rawCookies = socket.handshake.headers.cookie || '';
            const cookieToken = rawCookies
                .split(';')
                .map(c => c.trim())
                .find(c => c.startsWith('jwt='))
                ?.split('=')[1] || null;

            // Priority: cookie > auth.token > Authorization header
            const authToken = cookieToken || authHeaderToken || authHeader?.split(' ')[1];

            if (requestId) {
                // Basic validation for requestId (expecting UUID-like or alphabetic hash)
                if (typeof requestId !== 'string' || requestId.length < 24) {
                    return next(new Error('Authentication error: Invalid requestId'));
                }
                socket.requestId = requestId;
                return next();
            }

            if (!authToken) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = await promisify(jwt.verify)(
                authToken,
                config.jwtSecret,
                {
                    algorithms: ['HS256'],  // ✅ Algorithm restriction to prevent confusion attack
                }
            );
            const currentUser = await User.findById(decoded.id).select('+activeSessions');

            if (!currentUser) {
                return next(new Error('Authentication error: User no longer exists'));
            }

            // Validate the session is still active in the DB (same check as HTTP protect middleware).
            // This prevents force-logged-out users from maintaining a live socket connection.
            const hashedToken = crypto.createHash('sha256').update(authToken).digest('hex');
            const isSessionActive = currentUser.activeSessions?.some(
                session =>
                    session.sessionId === decoded.sid &&
                    session.token === hashedToken &&
                    session.expiresAt > Date.now()
            );

            if (!isSessionActive) {
                return next(new Error('Authentication error: Session expired or invalidated'));
            }

            socket.user = currentUser;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        if (socket.user) {
            const userId = socket.user._id.toString();
            socket.join(userId);
            console.log(`User ${userId} authenticated and joined room`);
        }

        if (socket.requestId) {
            socket.join(socket.requestId);
            console.log(`Socket joined public tracking room: ${socket.requestId}`);
        }

        // ── Real-time latency: respond to client pings with server timestamp ──
        socket.on('ping', () => {
            socket.emit('pong', { serverTime: Date.now() });
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

export const broadcastToUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

export const sendLoadingUpdate = (requestId, status, step = null, total = null) => {
    if (io && requestId) {
        // Compute a lightweight server load metric using OS CPU idle time
        const cpus = os.cpus();
        let idle = 0, total_ticks = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) { total_ticks += cpu.times[type]; }
            idle += cpu.times.idle;
        });
        const cpuUsagePercent = Math.round((1 - idle / total_ticks) * 100);
        const loadAvg = os.loadavg()[0]; // 1-minute load average
        const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
        const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);

        const payload = { status, timestamp: new Date(), step, total };
        const serverLoad = { cpuUsagePercent, loadAvg: +loadAvg.toFixed(2), freeMemMb, totalMemMb };

        io.to(requestId).emit('loading_update', payload);
        io.to(requestId).emit('server_load', serverLoad);
    }
};
