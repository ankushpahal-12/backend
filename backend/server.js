import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // Render free tier has no IPv6 outbound — force IPv4 DNS resolution

import config from './config/config.js';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocket } from './socket.js';

let server;
let isShuttingDown = false;

const shutdown = (signal, exitCode = 0) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully...`);

    if (!server) {
        process.exit(exitCode);
        return;
    }

    // Force exit if server doesn't close in time
    const forceExitTimer = setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);

    server.close(() => {
        clearTimeout(forceExitTimer);
        console.log('HTTP server closed.');
        process.exit(exitCode);
    });
};

const bootstrap = async () => {
    try {
        await connectDB();

        server = app.listen(config.port, () => {
            console.log(`App running in ${config.env} mode on port ${config.port}...`);
        });

        // Initialize Socket.io only after server is listening
        initSocket(server);
    } catch (error) {
        console.error('Startup failed:', error.message);
        process.exit(1);
    }
};

bootstrap();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    shutdown('uncaughtException', 1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    shutdown('unhandledRejection', 1);
});

process.on('SIGTERM', () => {
    shutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
    shutdown('SIGINT', 0);
});
