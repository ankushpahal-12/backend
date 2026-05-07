import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as authService from '../../../services/authService';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface SecurityProps {
    passwordData: {
        current: string;
        new: string;
        confirm: string;
    };
    setPasswordData: React.Dispatch<React.SetStateAction<{ current: string; new: string; confirm: string; }>>;
    handlePasswordChange: () => void;
    isChangingPassword?: boolean;
}

const Security: React.FC<SecurityProps> = ({ passwordData, setPasswordData, handlePasswordChange, isChangingPassword = false }) => {
    const { user, updateUser } = useAuth();
    const [totpCode, setTotpCode] = useState('');
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [showDisableInput, setShowDisableInput] = useState(false);

    const handle2FAEnable = async () => {
        setTwoFALoading(true);
        try {
            const res = await authService.setup2FA();
            const { otpauthUrl, base32 } = res.data;
            // Open setup page in a new tab with encoded params
            const params = new URLSearchParams({
                otpauthUrl: encodeURIComponent(otpauthUrl),
                base32,
                email: user?.email || '',
            });
            window.open(`/auth/2fa/setup?${params.toString()}`, '_blank');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to start 2FA setup.');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handle2FADisable = async () => {
        if (!totpCode.trim()) {
            toast.error('Please enter your authenticator code.');
            return;
        }
        setTwoFALoading(true);
        try {
            await authService.disable2FA(totpCode.trim());
            updateUser({ twoFactorEnabled: false });
            setTotpCode('');
            setShowDisableInput(false);
            toast.success('Two-factor authentication disabled.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setTwoFALoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Password Change */}
            <div className="space-y-6">
                <h4 className="text-white font-black tracking-tight ml-2">Rotate Master Key</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Current Key</label>
                        <input
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">New Sequence</label>
                        <input
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Confirm Sequence</label>
                        <input
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-xl border border-white/5 transition-all uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                    >
                        {isChangingPassword
                            ? <><Loader2 size={14} className="animate-spin" /> Rotating...</>
                            : 'Authorize Rotation'
                        }
                    </button>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <h4 className="text-white font-black tracking-tight">Two-Factor Authentication</h4>
                    {user?.twoFactorEnabled ? (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            Enabled
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-zinc-800 text-zinc-400 border border-white/5">
                            Disabled
                        </span>
                    )}
                </div>

                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
                    {user?.twoFactorEnabled ? (
                        <>
                            <div className="flex items-start gap-4">
                                {/* Shield icon */}
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">Google Authenticator is active</p>
                                    <p className="text-zinc-500 text-xs mt-1">Your account is protected with a time-based one-time password from your authenticator app.</p>
                                </div>
                            </div>

                            {!showDisableInput ? (
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => { setShowDisableInput(true); setTwoFAError(''); }}
                                        className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black rounded-xl border border-red-500/20 transition-all uppercase tracking-widest"
                                    >
                                        Disable 2FA
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Enter authenticator code to confirm</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-mono font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all"
                                        />
                                        <button
                                            onClick={handle2FADisable}
                                            disabled={twoFALoading}
                                            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black rounded-xl border border-red-500/20 transition-all uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {twoFALoading ? 'Verifying…' : 'Confirm'}
                                        </button>
                                        <button
                                            onClick={() => { setShowDisableInput(false); setTotpCode(''); setTwoFAError(''); }}
                                            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-black rounded-xl border border-white/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-start gap-4">
                                {/* Lock icon */}
                                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-white/5 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">Add an extra layer of security</p>
                                    <p className="text-zinc-500 text-xs mt-1">Use Google Authenticator or any TOTP app to generate time-based codes. A QR code setup page will open in a new tab.</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handle2FAEnable}
                                    disabled={twoFALoading}
                                    className="px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/20 transition-all uppercase tracking-widest disabled:opacity-50"
                                >
                                    {twoFALoading ? 'Generating…' : 'Enable 2FA'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Security;
