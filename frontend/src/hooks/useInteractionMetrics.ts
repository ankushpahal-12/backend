import { useEffect, useCallback, useRef } from 'react';

import type { InteractionMetrics } from '../types/auth.types';

export const useInteractionMetrics = () => {
    const pulseData = useRef({ count: 0, load: 0, lastPos: { x: 0, y: 0 } });
    const bufferData = useRef<{ series: number[]; lastSync: number }>({ series: [], lastSync: 0 });

    const trackPulse = useCallback((e: MouseEvent) => {
        const { clientX: x, clientY: y } = e;
        if (pulseData.current.lastPos.x !== 0) {
            const d = Math.sqrt(
                Math.pow(x - pulseData.current.lastPos.x, 2) +
                Math.pow(y - pulseData.current.lastPos.y, 2)
            );
            pulseData.current.load += d;
        }
        pulseData.current.count += 1;
        pulseData.current.lastPos = { x, y };
    }, []);

    const trackBuffer = useCallback(() => {
        const now = Date.now();
        if (bufferData.current.lastSync !== 0) {
            const delta = now - bufferData.current.lastSync;
            if (delta > 20 && delta < 2000) {
                bufferData.current.series.push(delta);
            }
        }
        bufferData.current.lastSync = now;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', trackPulse);
        window.addEventListener('keydown', trackBuffer);

        return () => {
            window.removeEventListener('mousemove', trackPulse);
            window.removeEventListener('keydown', trackBuffer);
        };
    }, [trackPulse, trackBuffer]);

    const packageMetrics = useCallback((): InteractionMetrics => {
        const series = bufferData.current.series;
        let variance = 0;
        if (series.length > 1) {
            const avg = series.reduce((a, b) => a + b, 0) / series.length;
            const squareDiffs = series.map(v => Math.pow(v - avg, 2));
            variance = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        }

        return {
            eventCount: pulseData.current.count,
            activityLoad: Math.round(pulseData.current.load),
            inputVariance: Math.round(variance),
            // @ts-expect-error - Checking for specific browser extensions / properties
            runtimeFlag: !!(navigator.webdriver || window.callPhantom || window._phantom || window.Buffer),
            timestamp: Date.now()
        };
    }, []);

    return { packageMetrics };
};
