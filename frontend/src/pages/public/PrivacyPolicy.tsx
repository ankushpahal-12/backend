import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import TelemetryNode from '../../components/common/TelemetryNode';
import LegalLayout from '../../components/common/LegalLayout';
import { Security, Lock, Visibility, Sync } from '@mui/icons-material';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "circOut" as const
            }
        }
    };

    const sections = [
        {
            id: "1",
            title: "Data Collection Protocols",
            icon: <Visibility />,
            color: "#10B981",
            text: "FinTrack AI collects telemetry data necessary for the operation of your neural wealth engine. This includes encrypted biometric hashes, transaction metadata, and synchronized shard identifiers. Our zero-knowledge infrastructure ensures that even we cannot access your raw financial data."
        },
        {
            id: "2",
            title: "Quantum Encryption Standards",
            icon: <Lock />,
            color: "#3B82F6",
            text: "All data is encrypted using AES-256 standard protocols before being fragmented across our sovereign mesh network. We employ k-anonymity principles for all external security checks, such as password breach verification."
        },
        {
            id: "3",
            title: "Shard Synchronization",
            icon: <Sync />,
            color: "#A855F7",
            text: "Your profile is synchronized across authorized matrix nodes (devices). You maintain full control over session concurrency and can revoke access to any node at any time via your security terminal."
        },
        {
            id: "4",
            title: "Third-Party Integration",
            icon: <Security />,
            color: "#F43F5E",
            text: "FinTrack AI may interface with external identity providers (e.g., Google Node Sync) only with explicit user authorization. We do not sell or trade your financial telemetry to external entities."
        }
    ];

    return (
        <LegalLayout>
            <TelemetryNode title="Privacy Policy" description="Neural Data Encryption Protocols" />
            <Container maxWidth="md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Stack spacing={2} sx={{ mb: 10, textAlign: 'center', position: 'relative' }}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'white', position: 'relative', zIndex: 1 }}>
                                Privacy <Box component="span" sx={{
                                    background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Policy</Box>
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, position: 'relative', zIndex: 1 }}>
                                SECURITY STANDARD v9 • UPDATED MARCH 2026
                            </Typography>
                        </Stack>
                    </motion.div>

                    <Stack spacing={8}>
                        {sections.map((section) => (
                            <motion.div
                                key={section.id}
                                variants={itemVariants}
                                className="relative pl-8 border-l border-white/10"
                            >
                                <Box sx={{ mb: 4 }}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                        <Box sx={{
                                            color: section.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {React.cloneElement(section.icon as React.ReactElement, { sx: { fontSize: 24 } })}
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                                            {section.title}
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'rgba(255,255,255,0.7)',
                                            lineHeight: 2,
                                            fontSize: '1.1rem',
                                            '& b': {
                                                color: section.color,
                                                fontWeight: 800
                                            }
                                        }}
                                    >
                                        {section.id === "1" && <>FinTrack AI collects <b>telemetry data</b> necessary for the operation of your <b>neural wealth engine</b>. This includes <b>encrypted biometric hashes</b>, <b>transaction metadata</b>, and <b>synchronized shard identifiers</b>. Our <b>zero-knowledge infrastructure</b> ensures that even we cannot access your <b>raw financial data</b>.</>}
                                        {section.id === "2" && <>All data is <b>encrypted</b> using <b>AES-256 standard protocols</b> before being fragmented across our <b>sovereign mesh network</b>. We employ <b>k-anonymity principles</b> for all external security checks, such as <b>password breach verification</b>.</>}
                                        {section.id === "3" && <>Your profile is <b>synchronized</b> across <b>authorized matrix nodes</b> (devices). You maintain <b>full control</b> over session concurrency and can <b>revoke access</b> to any node at any time via your <b>security terminal</b>.</>}
                                        {section.id === "4" && <>FinTrack AI may interface with <b>external identity providers</b> (e.g., Google Node Sync) only with <b>explicit user authorization</b>. We do <b>not sell or trade</b> your financial telemetry to external entities.</>}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Stack>
                </motion.div>
            </Container>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
