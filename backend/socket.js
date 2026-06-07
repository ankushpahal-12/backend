import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import os from 'os';
import config from './config/config.js';
import User from './models/User.js';

let io;

export const initSocket = (server) => {
    // Build array of allowed origins for Socket.io CORS
    const socketAllowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://backend-sandy-one-77.vercel.app',
    ];

    // Add additional allowed origins from config if available
    if (config.allowedOrigins && Array.isArray(config.allowedOrigins)) {
        socketAllowedOrigins.push(...config.allowedOrigins.filter(origin => !socketAllowedOrigins.includes(origin)));
    }

    io = new Server(server, {
        cors: {
            origin: socketAllowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    // Authenticate socket connection or allow public tracking via requestId
    io.use(async (socket, next) => {
        try {
            const { token: authHeaderToken, requestId } = socket.handshake.auth || {};
            const authHeader = socket.handshake.headers.authorization;

            const rawCookies = socket.handshake.headers.cookie || '';
            const cookieToken = rawCookies
                .split(';')
                .map(c => c.trim())
                .find(c => c.startsWith('jwt='))
                ?.split('=')[1] || null;

            const authToken = cookieToken || authHeaderToken || authHeader?.split(' ')[1];

            if (requestId) {
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
                { algorithms: ['HS256'] }
            );
            const currentUser = await User.findById(decoded.id).select('+activeSessions');

            if (!currentUser) {
                return next(new Error('Authentication error: User no longer exists'));
            }

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

            // Admins automatically join the global admin support inbox room
            if (socket.user.role === 'admin') {
                socket.join('admin:support');
                console.log(`Admin ${userId} joined admin:support inbox room`);
            }
        }

        if (socket.requestId) {
            socket.join(socket.requestId);
            console.log(`Socket joined public tracking room: ${socket.requestId}`);
        }

        // ── Real-time latency: respond to client pings with server timestamp ──
        socket.on('ping', () => {
            socket.emit('pong', { serverTime: Date.now() });
        });

        // ════════════════════════════════════════════════════════════════════
        // SUPPORT CHAT — Rate Limiting: 5 msgs per 10 seconds (sliding window)
        // ════════════════════════════════════════════════════════════════════
        const messageTimestamps = [];
        const RATE_LIMIT_MAX = 5;
        const RATE_LIMIT_WINDOW_MS = 10_000;

        const checkRateLimit = () => {
            const now = Date.now();
            while (messageTimestamps.length > 0 && now - messageTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
                messageTimestamps.shift();
            }
            if (messageTimestamps.length >= RATE_LIMIT_MAX) {
                socket.emit('rate_limit_error', {
                    message: 'Too many messages. Please slow down.',
                    retryAfter: Math.ceil((messageTimestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
                });
                return false;
            }
            messageTimestamps.push(now);
            return true;
        };

        // ── Join a conversation room ──────────────────────────────────────────
        socket.on('support:join_conversation', ({ conversationId }) => {
            if (!socket.user || !conversationId) return;
            socket.join(`conversation:${conversationId}`);
        });

        // ── Typing indicator ──────────────────────────────────────────────────
        socket.on('support:typing', ({ conversationId }) => {
            if (!socket.user || !conversationId) return;
            socket.to(`conversation:${conversationId}`).emit('support:typing', {
                userId: socket.user._id,
                userName: socket.user.name,
                conversationId,
            });
        });

        // ── Read receipt ──────────────────────────────────────────────────────
        socket.on('support:read', ({ conversationId, messageId }) => {
            if (!socket.user || !conversationId) return;
            socket.to(`conversation:${conversationId}`).emit('support:read_receipt', {
                messageId,
                readBy: { userId: socket.user._id, readAt: new Date() },
            });
        });

        // ── Rate-limit check (called before optimistic UI sends) ──────────────
        socket.on('support:message_check', () => {
            checkRateLimit();
        });

        // ════════════════════════════════════════════════════════════════════
        // TEST MANAGEMENT — Real-time test events
        // ════════════════════════════════════════════════════════════════════

        // Join test room to receive real-time updates
        socket.on('test:join', ({ testId, attemptId }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            socket.join(roomId);
            socket.emit('test:joined', {
                message: 'Successfully joined test room',
                roomId,
                timestamp: Date.now()
            });
        });

        // Leave test room
        socket.on('test:leave', ({ testId, attemptId }) => {
            const roomId = `test:${testId}:${attemptId}`;
            socket.leave(roomId);
            socket.emit('test:left', { roomId });
        });

        // Real-time answer save (auto-save)
        socket.on('test:answer_save', ({ testId, attemptId, questionId, selectedOptions, timeTaken }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            
            // Broadcast to monitoring admins
            io.to('admin:test-monitoring').emit('test:answer_saved', {
                userId: socket.user._id,
                userName: socket.user.name,
                testId,
                attemptId,
                questionId,
                timestamp: Date.now()
            });
        });

        // Timer update (keep-alive for inactivity detection)
        socket.on('test:timer_update', ({ testId, attemptId, remainingSeconds }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            
            socket.to(roomId).emit('test:timer_sync', {
                remainingSeconds,
                timestamp: Date.now()
            });

            // Alert if time < 2 minutes
            if (remainingSeconds < 120) {
                socket.emit('test:time_warning', {
                    message: 'Less than 2 minutes remaining',
                    remainingSeconds
                });
            }
        });

        // Question navigation
        socket.on('test:navigate_question', ({ testId, attemptId, questionIndex }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            
            socket.to(roomId).emit('test:user_navigated', {
                userId: socket.user._id,
                questionIndex,
                timestamp: Date.now()
            });
        });

        // Flag for review
        socket.on('test:flag_review', ({ testId, attemptId, questionId, flagged }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            
            // Notify admin monitoring
            io.to('admin:test-monitoring').emit('test:question_flagged', {
                userId: socket.user._id,
                testId,
                attemptId,
                questionId,
                flagged,
                timestamp: Date.now()
            });
        });

        // Test submission
        socket.on('test:submit', ({ testId, attemptId }) => {
            if (!socket.user) return;
            const roomId = `test:${testId}:${attemptId}`;
            
            // Leave the test room
            socket.leave(roomId);
            
            // Notify admins
            io.to('admin:test-monitoring').emit('test:submitted', {
                userId: socket.user._id,
                userName: socket.user.name,
                testId,
                attemptId,
                timestamp: Date.now()
            });
        });

        // Admin join test monitoring
        socket.on('admin:monitor_tests', () => {
            if (!socket.user || socket.user.role !== 'admin') return;
            socket.join('admin:test-monitoring');
            socket.emit('admin:monitoring_active', {
                message: 'Test monitoring activated',
                timestamp: Date.now()
            });
        });

        // Admin: Broadcast test availability to all users
        socket.on('admin:notify_test_published', ({ testId, testTitle }) => {
            if (!socket.user || socket.user.role !== 'admin') return;
            io.emit('tests:new_test_available', {
                testId,
                testTitle,
                publishedAt: Date.now()
            });
        });

        // Admin: Block user from test (e.g., for cheating detection)
        socket.on('admin:block_user_test', ({ userId, testId, reason }) => {
            if (!socket.user || socket.user.role !== 'admin') return;
            io.to(userId).emit('test:user_blocked', {
                testId,
                reason,
                blockedAt: Date.now()
            });
        });

        // User: Report test issue
        socket.on('test:report_issue', ({ testId, attemptId, issue }) => {
            if (!socket.user) return;
            io.to('admin:test-monitoring').emit('test:issue_reported', {
                userId: socket.user._id,
                userName: socket.user.name,
                testId,
                attemptId,
                issue,
                timestamp: Date.now()
            });
        });

        // ════════════════════════════════════════════════════════════════════
        // REAL-TIME LOADER — Website processing status updates
        // ════════════════════════════════════════════════════════════════════

        // Admin: Send loader update to all connected clients
        socket.on('loader:update', ({ loaderKey, progress, message, subMessage, status }) => {
            if (!socket.user || socket.user.role !== 'admin') return;
            
            // Broadcast to all clients
            io.emit('loader:progress', {
                loaderKey,
                progress: Math.min(progress, 100),
                message,
                subMessage,
                status,
                timestamp: Date.now(),
            });
        });

        // Admin: Send website-wide processing status
        socket.on('website:status', ({ isProcessing, message, progress, status }) => {
            if (!socket.user || socket.user.role !== 'admin') return;
            
            // Broadcast to all clients in landing page
            io.emit('website:status:update', {
                isProcessing,
                message: message || (isProcessing ? 'Website is processing...' : 'Website is ready'),
                progress: progress || 0,
                status: status || (isProcessing ? 'processing' : 'success'),
                timestamp: Date.now(),
            });

            console.log(`[Website Status] Admin ${socket.user._id} updated status: ${isProcessing ? 'Processing' : 'Ready'}`);
        });

        // Admin: Send targeted loader update to specific user
        socket.on('loader:update-user', ({ userId, loaderKey, progress, message, subMessage, status }) => {
            if (!socket.user || socket.user.role !== 'admin') return;
            
            io.to(userId.toString()).emit('loader:progress', {
                loaderKey,
                progress: Math.min(progress, 100),
                message,
                subMessage,
                status,
                timestamp: Date.now(),
            });
        });

        // Client: Request current processing status
        socket.on('loader:request-status', () => {
            // This would be used if you want to query current status
            // For now, clients connect and listen for updates
            socket.emit('loader:status-requested', {
                timestamp: Date.now(),
            });
        });

        socket.on('disconnect', () => {
            if (socket.user) {
                console.log(`User ${socket.user._id} disconnected`);
            } else {
                console.log(`Socket disconnected`);
            }
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
        const cpus = os.cpus();
        let idle = 0, total_ticks = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) { total_ticks += cpu.times[type]; }
            idle += cpu.times.idle;
        });
        const cpuUsagePercent = Math.round((1 - idle / total_ticks) * 100);
        const loadAvg = os.loadavg()[0];
        const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
        const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);

        const payload = { status, timestamp: new Date(), step, total };
        const serverLoad = { cpuUsagePercent, loadAvg: +loadAvg.toFixed(2), freeMemMb, totalMemMb };

        io.to(requestId).emit('loading_update', payload);
        io.to(requestId).emit('server_load', serverLoad);
    }
};

// Emit real-time loader progress to all connected clients
export const broadcastLoaderUpdate = (loaderKey, progress, message, subMessage = null, status = 'loading') => {
    if (io) {
        io.emit('loader:progress', {
            loaderKey,
            progress: Math.min(progress, 100),
            message,
            subMessage,
            status,
            timestamp: Date.now(),
        });
    }
};

// Emit website-wide processing status to all connected clients
export const broadcastWebsiteStatus = (isProcessing, message = null, progress = 0, status = null) => {
    if (io) {
        io.emit('website:status:update', {
            isProcessing,
            message: message || (isProcessing ? 'Website is processing...' : 'Website is ready'),
            progress,
            status: status || (isProcessing ? 'processing' : 'success'),
            timestamp: Date.now(),
        });
    }
};

// Emit loader update to specific user
export const emitLoaderUpdateToUser = (userId, loaderKey, progress, message, subMessage = null, status = 'loading') => {
    if (io) {
        io.to(userId.toString()).emit('loader:progress', {
            loaderKey,
            progress: Math.min(progress, 100),
            message,
            subMessage,
            status,
            timestamp: Date.now(),
        });
    }
};
