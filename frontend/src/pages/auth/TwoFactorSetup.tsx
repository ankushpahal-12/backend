import React from 'react';
import { useTwoFactor } from '../../hooks/useTwoFactor';

const TwoFactorSetup: React.FC = () => {
    const {
        email, base32, qrDataUrl,
        token, error, success, loading, copied,
        handleCopy, handleVerify, handleTokenChange,
    } = useTwoFactor();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #09090b 0%, #111116 60%, #0d1117 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            padding: '24px',
        }}>
            {success ? (
                /* ─── Success State ─── */
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 800, margin: '0 0 12px' }}>2FA Activated!</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: '0 0 8px' }}>
                        Two-factor authentication has been enabled for
                    </p>
                    <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, margin: '0 0 28px' }}>{email}</p>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6, margin: '0 0 28px' }}>
                        A confirmation email has been sent. You can now close this tab and go back to settings.
                    </p>
                    <button
                        onClick={() => window.close()}
                        style={{
                            padding: '12px 32px', background: 'rgba(16,185,129,0.1)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px',
                            fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer',
                        }}
                    >
                        Close Tab
                    </button>
                </div>
            ) : (
                /* ─── Setup Flow ─── */
                <div style={{ width: '100%', maxWidth: '920px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span style={{ color: '#818cf8', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                AI Finance Copilot
                            </span>
                        </div>
                        <h1 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                            Set Up Two-Factor Authentication
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                            Securing <strong style={{ color: '#94a3b8' }}>{email}</strong> — scan the QR code then confirm with a 6-digit code
                        </p>
                    </div>

                    {/* Two-Column Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                        gap: '20px',
                        alignItems: 'stretch',
                    }}>
                        {/* ── LEFT: QR Code ── */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '20px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                        }}>
                            {/* Step badge */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                marginBottom: '24px', alignSelf: 'flex-start',
                            }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 800, color: '#818cf8',
                                }}>1</div>
                                <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    Scan QR Code
                                </span>
                            </div>

                            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, margin: '0 0 28px', alignSelf: 'flex-start' }}>
                                Open <strong style={{ color: '#94a3b8' }}>Google Authenticator</strong> or any TOTP app and scan the QR code below.
                            </p>

                            {/* QR Code display */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {qrDataUrl ? (
                                    <div style={{
                                        padding: '16px',
                                        background: '#fff',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 30px rgba(99,102,241,0.2)',
                                        border: '2px solid rgba(99,102,241,0.2)',
                                    }}>
                                        <img src={qrDataUrl} alt="2FA QR Code" style={{ display: 'block', width: '200px', height: '200px' }} />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '232px', height: '232px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px dashed rgba(255,255,255,0.1)',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '32px', height: '32px', border: '2px solid rgba(99,102,241,0.4)',
                                                borderTopColor: '#818cf8', borderRadius: '50%',
                                                animation: 'spin 1s linear infinite', margin: '0 auto 12px',
                                            }} />
                                            <span style={{ color: '#475569', fontSize: '12px' }}>Generating…</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                                Can't scan? Use the manual key on the right →
                            </p>
                        </div>

                        {/* ── RIGHT: Manual Key + OTP ── */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '20px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                        }}>
                            {/* Manual Key Section */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 800, color: '#818cf8',
                                    }}>2</div>
                                    <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                        Or Enter Key Manually
                                    </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, margin: '0 0 14px' }}>
                                    Can't scan? Copy the secret key below and paste it in your authenticator app.
                                </p>
                                <div style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <code style={{
                                            flex: 1,
                                            color: '#818cf8', fontSize: '12px',
                                            fontFamily: 'monospace', letterSpacing: '0.08em', wordBreak: 'break-all',
                                            lineHeight: 1.5,
                                        }}>{base32}</code>
                                        <button
                                            onClick={handleCopy}
                                            title="Copy key"
                                            style={{
                                                padding: '8px 14px',
                                                background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                                                border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.2)'}`,
                                                borderRadius: '8px', cursor: 'pointer',
                                                color: copied ? '#10b981' : '#818cf8',
                                                fontSize: '11px', fontWeight: 700,
                                                flexShrink: 0, transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {copied ? (
                                                <>
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                <span style={{ color: '#334155', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Then Verify</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            </div>

                            {/* OTP Verify Section */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 800, color: '#818cf8',
                                    }}>3</div>
                                    <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                        Enter Verification Code
                                    </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, margin: '0 0 14px' }}>
                                    Enter the 6-digit code shown in your authenticator app to confirm setup.
                                </p>

                                {/* White card OTP input */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.97)',
                                    borderRadius: '14px',
                                    padding: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '10px', fontWeight: 800,
                                        color: '#64748b', letterSpacing: '0.12em',
                                        textTransform: 'uppercase', marginBottom: '10px',
                                    }}>
                                        Authenticator Code
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={token}
                                        onChange={(e) => { handleTokenChange(e.target.value); }}
                                        placeholder="000 000"
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: '#f8fafc',
                                            border: `2px solid ${error ? '#fca5a5' : token.length === 6 ? '#6ee7b7' : '#e2e8f0'}`,
                                            borderRadius: '10px', padding: '14px 12px',
                                            color: '#0f172a',
                                            fontSize: '26px', fontFamily: 'monospace', fontWeight: 700,
                                            textAlign: 'center', letterSpacing: '0.4em',
                                            outline: 'none', transition: 'border 0.2s',
                                        }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = error ? '#fca5a5' : token.length === 6 ? '#6ee7b7' : '#e2e8f0';
                                        }}
                                    />
                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, margin: '8px 0 0', textAlign: 'center' }}>{error}</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleVerify}
                                disabled={loading || token.length !== 6}
                                style={{
                                    width: '100%', padding: '15px',
                                    background: loading || token.length !== 6
                                        ? 'rgba(99,102,241,0.15)'
                                        : 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    color: loading || token.length !== 6 ? 'rgba(129,140,248,0.5)' : '#fff',
                                    border: 'none', borderRadius: '12px',
                                    fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                                    cursor: loading || token.length !== 6 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: loading || token.length !== 6 ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            style={{ animation: 'spin 1s linear infinite' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Activating…
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Activate 2FA
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Responsive CSS */}
                    <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                        @media (max-width: 640px) {
                            .twofa-grid { grid-template-columns: 1fr !important; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
