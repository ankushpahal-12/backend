import React, { useState } from 'react';
import { Trash2, ShieldCheck, Key, ArrowRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestPurgeOtp, verifyPurgeOtp, purgeAccount, deactivateAccount } from '../../../services/dataService';

type VerificationStage = 'idle' | 'otp' | 'password';
type ActionType = 'deactivate' | 'purge' | null;

const AccountManage: React.FC = () => {
    const [stage, setStage] = useState<VerificationStage>('idle');
    const [action, setAction] = useState<ActionType>(null);
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetFlow = () => {
        setStage('idle');
        setAction(null);
        setOtp('');
        setPassword('');
        setError('');
        setLoading(false);
    };

    const handleInitialAction = async (type: ActionType) => {
        setLoading(true);
        setError('');
        try {
            await requestPurgeOtp();
            setAction(type);
            setStage('otp');
        } catch {
            setError('Failed to initiate secure protocol.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) return;
        setLoading(true);
        setError('');
        try {
            await verifyPurgeOtp(otp);
            setStage('password');
        } catch {
            setError('Invalid or expired neural code.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalAction = async () => {
        if (!password) return;
        setLoading(true);
        setError('');
        try {
            if (action === 'deactivate') {
                await deactivateAccount(password);
                alert("Neural Core Suspended.");
                localStorage.clear();
                window.location.href = '/';
            } else {
                await purgeAccount(password);
                alert("Account Permanently Purged.");
                localStorage.clear();
                window.location.href = '/';
            }
            resetFlow();
        } catch {
            setError('Authorization sequence mismatch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Cards (Trigger Section) */}
            <div className="p-8 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-red-500/10 transition-colors">
                <div className="flex gap-4 items-center sm:items-start text-center sm:text-left flex-col sm:flex-row">
                    <div className="p-3 bg-white/5 text-zinc-400 rounded-xl"><Trash2 size={24} /></div>
                    <div>
                        <h4 className="text-white font-black tracking-tight">Account Protocols</h4>
                        <p className="text-zinc-500 text-xs mt-1">Suspend your core or permanently purge all neural data.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => handleInitialAction('deactivate')}
                        disabled={loading && stage === 'idle'}
                        className="flex-1 sm:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                    >
                        Deactivate
                    </button>
                    <button
                        onClick={() => handleInitialAction('purge')}
                        disabled={loading && stage === 'idle'}
                        className="flex-1 sm:flex-none px-6 py-3 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/5 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-red-500/10"
                    >
                        Purge Account
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {stage !== 'idle' && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetFlow}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12"
                        >
                            <button
                                onClick={resetFlow}
                                className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl"
                            >
                                <X size={20} />
                            </button>

                            <AnimatePresence mode="wait">
                                {stage === 'otp' && (
                                    <motion.div
                                        key="otp"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="text-center space-y-8"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                            <ShieldCheck size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Neural Sync Required</h3>
                                            <p className="text-zinc-500 text-sm font-medium">A verification code has been dispatched to your primary node address.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Enter Neural Code"
                                                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl font-black tracking-[0.5em] text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
                                            />
                                            {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={loading || otp.length < 4}
                                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 size={24} className="animate-spin" /> : <><ArrowRight size={20} strokeWidth={3} /> Verify Sequence</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {stage === 'password' && (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="text-center space-y-8"
                                    >
                                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 shadow-xl shadow-red-500/5">
                                            <Key size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Authorization Check</h3>
                                            <p className="text-zinc-500 text-sm font-medium">Finalize the {action} sequence by providing your master authorization key.</p>
                                            <p className="text-red-500/60 text-[10px] font-black uppercase tracking-widest mt-4 bg-red-500/5 py-2 px-4 rounded-lg inline-block">Warning: This action is non-reversible</p>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Master Password"
                                                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-center text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all font-black text-lg"
                                            />
                                            {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}
                                            <button
                                                onClick={handleFinalAction}
                                                disabled={loading || !password}
                                                className="w-full py-5 bg-red-500 hover:bg-red-400 text-black font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Trash2 size={20} strokeWidth={3} /> Finalize Purge</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountManage;
