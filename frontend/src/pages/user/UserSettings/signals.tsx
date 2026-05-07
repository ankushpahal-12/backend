import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignalsProps {
    notifications: {
        email: boolean;
        push: boolean;
        webhooks: boolean;
        aiInsights: boolean;
    };
    setNotifications: React.Dispatch<React.SetStateAction<{ email: boolean; push: boolean; webhooks: boolean; aiInsights: boolean; }>>;
}

const Signals: React.FC<SignalsProps> = ({ notifications, setNotifications }) => {
    return (
        <div className="space-y-10">
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/10 rounded-[2.5rem] flex items-center gap-6">
                <div className="p-4 bg-purple-500 rounded-2xl text-black shadow-xl">
                    <Bell size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white tracking-tight">Signal Protocols</h4>
                    <p className="text-zinc-500 text-sm">Configure how neural insights are delivered to your interface.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'email', label: 'Email Transmissions', desc: 'Summary of daily ledger activity' },
                    { id: 'push', label: 'Push Directives', desc: 'Real-time alerts for threshold breaches' },
                    { id: 'webhooks', label: 'API Webhooks', desc: 'Raw data streams for external nodes' },
                    { id: 'aiInsights', label: 'AI Advisory', desc: 'Predictive analytics and tactical tips' }
                ].map((item) => (
                    <div key={item.id} className="p-6 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-purple-500/20 transition-all">
                        <div>
                            <h5 className="text-white font-bold text-sm tracking-tight">{item.label}</h5>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
                        </div>
                        <div
                            onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications[item.id as keyof typeof notifications] ? 'bg-purple-500' : 'bg-zinc-800'}`}
                        >
                            <motion.div
                                animate={{ x: notifications[item.id as keyof typeof notifications] ? 26 : 4 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Signals;
