import { useEffect } from 'react';

interface TelemetryNodeProps {
    title: string;
    description?: string;
}

const TelemetryNode = ({ title, description }: TelemetryNodeProps) => {
    useEffect(() => {
        // Global Sync: Node Identification
        document.title = `${title} | Matrix Cloud Node - Operational`;

        const metaDescription = document.querySelector('meta[name="description"]');
        const defaultDesc = 'Matrix core operational node. Synchronizing financial data streams with encrypted protocols.';

        if (metaDescription) {
            metaDescription.setAttribute('content', description || defaultDesc);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'description';
            newMeta.content = description || defaultDesc;
            document.head.appendChild(newMeta);
        }

        const pushMetric = (name: string, content: string) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                (meta as HTMLMetaElement).name = name;
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        pushMetric('node-tier', 'Level-01 Operational');
        pushMetric('robots', 'noindex, nofollow');
        pushMetric('theme-color', '#0f172a');
        pushMetric('referrer', 'no-referrer');
        pushMetric('format-detection', 'telephone=no');

    }, [title, description]);

    return null;
};

export default TelemetryNode;
