import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import TelemetryNode from '../components/common/TelemetryNode';
import LegalLayout from '../components/common/LegalLayout';
import { Gavel, Fingerprint, Hub, Security } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const TermsOfService: React.FC = () => {
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

    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "circOut"
            }
        }
    };

    const sections = [
        {
            id: "1",
            title: "Neural Access License",
            icon: <Fingerprint />,
            color: "#6366F1",
            text: "By initializing a FinTrack AI profile, you agree to abide by our sovereign wealth management protocols. You are granted a non-exclusive, revocable license to operate your personal financial intelligence layer."
        },
        {
            id: "2",
            title: "Shard Responsibility",
            icon: <Hub />,
            color: "#A855F7",
            text: "The security of your access keys and authorized matrix nodes (devices) is your sole responsibility. FinTrack AI is not liable for data loss or unauthorized financial telemetry access resulting from compromised user security protocols."
        },
        {
            id: "3",
            title: "Prohibited Interfacing",
            icon: <Security />,
            color: "#F43F5E",
            text: "Reverse-engineering our cognitive analysis engines or attempting to breach the sovereign mesh network is strictly prohibited and will result in permanent account de-initialization."
        },
        {
            id: "4",
            title: "Real-Time Telemetry Drift",
            icon: <Gavel />,
            color: "#10B981",
            text: "While our algorithms aim for millisecond precision, FinTrack AI does not guarantee 100% accuracy in real-time financial tracking due to the inherent latency in global capital networks."
        }
    ];

    return (
        <LegalLayout>
            <TelemetryNode title="Terms of Service" description="FinTrack AI Neural Wealth Protocol" />
            <Container maxWidth="md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Stack spacing={2} sx={{ mb: 10, textAlign: 'center', position: 'relative' }}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'white', position: 'relative', zIndex: 1 }}>
                                Terms of <Box component="span" sx={{
                                    background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Service</Box>
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, position: 'relative', zIndex: 1 }}>
                                PROTOCOL v4 • UPDATED MARCH 2026
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
                                        {section.id === "1" && <>By initializing a <b>FinTrack AI profile</b>, you agree to abide by our <b>sovereign wealth management protocols</b>. You are granted a <b>non-exclusive, revocable license</b> to operate your <b>personal financial intelligence layer</b>.</>}
                                        {section.id === "2" && <>The <b>security</b> of your <b>access keys</b> and <b>authorized matrix nodes</b> (devices) is your <b>sole responsibility</b>. FinTrack AI is <b>not liable</b> for <b>data loss</b> or <b>unauthorized financial telemetry access</b> resulting from compromised user security protocols.</>}
                                        {section.id === "3" && <><b>Reverse-engineering</b> our <b>cognitive analysis engines</b> or attempting to <b>breach the sovereign mesh network</b> is <b>strictly prohibited</b> and will result in <b>permanent account de-initialization</b>.</>}
                                        {section.id === "4" && <>While our <b>algorithms</b> aim for <b>millisecond precision</b>, FinTrack AI does <b>not guarantee 100% accuracy</b> in <b>real-time financial tracking</b> due to the inherent latency in <b>global capital networks</b>.</>}
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

export default TermsOfService;
