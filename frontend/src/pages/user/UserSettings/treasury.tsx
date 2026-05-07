import React from 'react';
import { CreditCard } from 'lucide-react';

const Treasury: React.FC = () => {
    return (
        <div className="space-y-10">
            <div className="p-10 bg-zinc-950 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform"><CreditCard size={120} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-lg uppercase tracking-widest">Active Tier</div>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Billed Monthly</span>
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-2">Neural <span className="text-emerald-500">Pro Plan.</span></h3>
                    <p className="text-zinc-400 text-sm max-w-sm mb-8 font-medium">Full access to AI forecasting, unlimited ledger entries, and priority neural sync.</p>

                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-3xl font-black text-white tracking-tighter">₹999</span>
                        <span className="text-zinc-600 font-bold text-sm">/ month</span>
                    </div>

                    <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95">Manage Subscription</button>
                </div>
            </div>
        </div>
    );
};

export default Treasury;
