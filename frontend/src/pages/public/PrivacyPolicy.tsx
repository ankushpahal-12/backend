import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import TelemetryNode from '../../components/common/TelemetryNode';
import LegalLayout from '../../components/common/LegalLayout';
import { Security, Lock, Visibility, Sync, Public, Storage} from '@mui/icons-material';
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
            title: "Information We Collect",
            icon: <Visibility />,
            color: "#10B981"
        },
        {
            id: "2",
            title: "Data Security",
            icon: <Lock />,
            color: "#3B82F6"
        },
        {
            id: "3",
            title: "Session & Device Management",
            icon: <Sync />,
            color: "#A855F7"
        },
        {
            id: "4",
            title: "Assessment Monitoring",
            icon: <Security />,
            color: "#F43F5E"
        },
        {
            id: "5",
            title: "Third-Party Services",
            icon: <Public />,
            color: "#F59E0B"
        },
        {
            id: "6",
            title: "Data Retention",
            icon: <Storage />,
            color: "#06B6D4"
        }
    ];

    return (
        <LegalLayout>
            <TelemetryNode
                title="Privacy Policy"
                description="Platform Security & Data Protection Standards"
            />

            <Container maxWidth="md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Stack
                            spacing={2}
                            sx={{
                                mb: 10,
                                textAlign: 'center',
                                position: 'relative'
                            }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                Privacy{' '}
                                <Box
                                    component="span"
                                    sx={{
                                        background:
                                            'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Policy
                                </Box>
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 600,
                                    letterSpacing: 1,
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                SECURITY STANDARD • UPDATED MAY 2026
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
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                        sx={{ mb: 3 }}
                                    >
                                        <Box
                                            sx={{
                                                color: section.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {React.cloneElement(
                                                section.icon as React.ReactElement,
                                                {
                                                    sx: { fontSize: 24 }
                                                }
                                            )}
                                        </Box>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 900,
                                                color: 'white',
                                                letterSpacing: '-0.01em'
                                            }}
                                        >
                                            {section.title}
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'rgba(255,255,255,0.7)',
                                            lineHeight: 2,
                                            fontSize: '1.05rem',
                                            '& b': {
                                                color: section.color,
                                                fontWeight: 800
                                            }
                                        }}
                                    >
                                        {section.id === "1" && (
                                            <>
                                                We collect <b>essential account and assessment-related information</b>
                                                including your name, email address, login activity,
                                                assessment responses, device information, IP address,
                                                and session metadata to ensure secure platform
                                                functionality and improve user experience.
                                            </>
                                        )}

                                        {section.id === "2" && (
                                            <>
                                                All sensitive information is protected using
                                                <b> industry-standard encryption protocols</b>,
                                                secure HTTPS communication, password hashing,
                                                secure authentication systems, and
                                                <b> role-based access controls</b>. We continuously
                                                monitor and improve our infrastructure to protect
                                                user data from unauthorized access.
                                            </>
                                        )}

                                        {section.id === "3" && (
                                            <>
                                                Users can manage <b>active sessions across devices</b>.
                                                Suspicious login attempts, concurrent sessions,
                                                and unauthorized access attempts may be monitored
                                                for security and fraud prevention purposes.
                                                Users may revoke device access at any time.
                                            </>
                                        )}

                                        {section.id === "4" && (
                                            <>
                                                During assessments, the platform may monitor
                                                <b> tab switching, fullscreen exits, unusual activity,
                                                rapid navigation patterns, and copy/paste actions</b>
                                                to help maintain assessment integrity and prevent
                                                unauthorized behavior. Security events may be logged
                                                for audit and review purposes.
                                            </>
                                        )}

                                        {section.id === "5" && (
                                            <>
                                                We may use trusted <b>third-party services</b>
                                                such as authentication providers, analytics tools,
                                                cloud hosting platforms, and email services to
                                                operate the platform securely and efficiently.
                                                We do <b>not sell or trade personal user data</b>
                                                to external parties.
                                            </>
                                        )}

                                        {section.id === "6" && (
                                            <>
                                                Assessment records, account information,
                                                and security logs may be retained for a
                                                limited period to support analytics,
                                                fraud prevention, compliance, and platform
                                                operations. Users may request account
                                                deletion or data removal subject to
                                                applicable legal and operational requirements.
                                            </>
                                        )}
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

