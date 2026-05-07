import React from 'react';
import { User, Save } from 'lucide-react';

interface IdentityProps {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        currency: string;
        savingsTarget: number;
    };
    setFormData: (data: IdentityProps['formData']) => void;
    handleSave: () => void;
}

const Identity: React.FC<IdentityProps> = ({ formData, setFormData, handleSave }) => {
    return (
        <div className="space-y-12">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all overflow-hidden">
                        <User size={64} className="text-emerald-500/40 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Update</span>
                        </div>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">Neural Identity</h3>
                    <p className="text-zinc-500 font-medium text-sm">Configure your personal and financial core settings.</p>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Primary Alias</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                        placeholder="First Name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Secondary Alias</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                        placeholder="Last Name"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Neural Address (Email)</label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-zinc-500 cursor-not-allowed font-bold"
                    />
                </div>
            </div>

            {/* Financial Core */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h4 className="text-white font-black tracking-tight">Financial Core Protocols</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Base Currency</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Savings Target (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.savingsTarget}
                                onChange={(e) => setFormData({ ...formData, savingsTarget: Number(e.target.value) })}
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                            />
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 text-zinc-500 font-black text-xs uppercase tracking-widest">Target</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all">Discard</button>
                <button
                    onClick={handleSave}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl shadow-xl shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} strokeWidth={3} />
                    Update Profile
                </button>
            </div>
        </div>
    );
};

export default Identity;
