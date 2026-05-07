import React from 'react';
import { Typography,  Button, Stack, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
	ArrowUpRight, 
	BrainCircuit,
	Play,
	Clock,
	BarChart3,
	Flame, 
	Target, 
	BookOpen,
	AlertTriangle
} from 'lucide-react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import Card from '../../../components/ui/Card';
import { useThemeContext } from '../../../context/ThemeContext';
import DashboardLayout from './DashboardLayout';

const accuracyTrend = [
	{ test: 'Test 1', accuracy: 65 },
	{ test: 'Test 2', accuracy: 68 },
	{ test: 'Test 3', accuracy: 74 },
	{ test: 'Test 4', accuracy: 72 },
	{ test: 'Test 5', accuracy: 79 },
	{ test: 'Test 6', accuracy: 82 },
	{ test: 'Test 7', accuracy: 85 },
];

const topicPerformance = [
	{ topic: 'Arrays', score: 92 },
	{ topic: 'Trees', score: 78 },
	{ topic: 'Graphs', score: 65 },
	{ topic: 'Dynamic Prog.', score: 45 },
	{ topic: 'Recursion', score: 85 },
];

const recentTests = [
	{ id: 1, title: 'Weekly Mock: Data Structures', score: '82%', time: '45 mins ago', status: 'completed' },
	{ id: 2, title: 'Topic Test: Dynamic Programming', score: '45%', time: '2 days ago', status: 'needs_review' },
	{ id: 3, title: 'Quick Quiz: Graph Traversal', score: '90%', time: '3 days ago', status: 'excellent' },
];

const toneToColor = {
	needs_review: '#ec4899', // Pink
	completed: '#6366f1',    // Indigo
	excellent: '#a855f7',    // Purple
} as const;

// Framer Motion Variants
const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.1 }
	}
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

type StatCardProps = {
	title: string;
	value: string;
	hint: string;
	icon: React.ReactNode;
	trend?: 'up' | 'down' | 'neutral';
};

const StatCard: React.FC<StatCardProps> = ({ title, value, hint, icon, trend }) => {
	return (
		<motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }} className="h-full">
			<Card sx={{ height: '100%', p: 2.5 }}>
				<div className="flex items-start justify-between gap-3">
					<div>
						<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
							{title}
						</Typography>
						<Typography variant="h4" sx={{ mt: 1, fontWeight: 900 }}>
							{value}
						</Typography>
						<Typography variant="caption" sx={{ color: trend === 'down' ? '#ec4899' : 'text.secondary', display: 'block', mt: 0.5, fontWeight: trend === 'down' ? 700 : 500 }}>
							{hint}
						</Typography>
					</div>
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-600 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-pink-500/30 dark:text-purple-300 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]">
						{icon}
					</div>
				</div>
			</Card>
		</motion.div>
	);
};

type PanelCardProps = {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	action?: React.ReactNode;
};

const PanelCard: React.FC<PanelCardProps> = ({ title, subtitle, children, action }) => {
	return (
		<Card sx={{ p: 3, height: '100%' }}>
			<div className="flex items-start justify-between mb-4">
				<div>
					<Typography variant="h6" sx={{ fontWeight: 800 }}>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
							{subtitle}
						</Typography>
					)}
				</div>
				{action && <div>{action}</div>}
			</div>
			{children}
		</Card>
	);
};

const DashboardPage: React.FC = () => {
	const navigate = useNavigate();
	const { mode } = useThemeContext();
	const isLightMode = mode === 'light';

	return (
		<DashboardLayout
			title="Student Dashboard"
			subtitle="Track your mastery, identify weak points, and let AI guide your next study session."
		>
			<motion.div 
				className="flex flex-col gap-6 w-full"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				
				{/* Hero Welcome Banner */}
				<motion.div variants={itemVariants}>
					<Card sx={{ p: { xs: 3, md: 5 }, position: 'relative', overflow: 'hidden' }}>
						<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
						<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div>
								<Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
									Welcome back, Alex! 👋
								</Typography>
								<Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500 }}>
									Your accuracy is trending up! You're fully prepared for the upcoming assessment.
								</Typography>
							</div>
							<motion.div 
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.4, type: 'spring' }}
								className="bg-white/40 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm min-w-[200px] text-center"
							>
								<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
									Overall Readiness
								</Typography>
								<div className="flex items-baseline justify-center gap-1 mt-0.5">
									<Typography variant="h2" sx={{ fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
										85
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 800, color: '#a855f7' }}>
										%
									</Typography>
								</div>
							</motion.div>
						</div>
					</Card>
				</motion.div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					
					{/* Left Column (Main Focus - 70%) */}
					<div className="lg:col-span-8 flex flex-col gap-6">
						
						{/* Quick Stats Grid */}
						<motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard title="Accuracy" value="78%" hint="+4% this week" icon={<Target size={24} />} />
							<StatCard title="Tests Taken" value="24" hint="3 in last 7 days" icon={<BookOpen size={24} />} />
							<StatCard title="Streak" value="14 🔥" hint="Keep it going!" icon={<Flame size={24} />} />
							<StatCard title="Weakest Topic" value="DP" hint="-12% vs average" icon={<AlertTriangle size={24} />} trend="down" />
						</motion.div>

						{/* Charts Area */}
						<motion.div variants={itemVariants}>
							<PanelCard title="Accuracy Trend" subtitle="Your performance over the last 7 tests">
								<div style={{ width: '100%', height: 320 }}>
									<ResponsiveContainer>
										<AreaChart data={accuracyTrend} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
											<defs>
												<linearGradient id="colorAccuracyArea" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#a855f7" stopOpacity={isLightMode ? 0.3 : 0.4}/>
													<stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
												</linearGradient>
												<linearGradient id="colorAccuracyStroke" x1="0" y1="0" x2="1" y2="0">
													<stop offset="0%" stopColor="#6366f1" />
													<stop offset="50%" stopColor="#a855f7" />
													<stop offset="100%" stopColor="#ec4899" />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? '#e2e8f0' : '#334155'} />
											<XAxis dataKey="test" axisLine={false} tickLine={false} stroke={isLightMode ? '#64748b' : '#94a3b8'} dy={10} />
											<YAxis axisLine={false} tickLine={false} stroke={isLightMode ? '#64748b' : '#94a3b8'} domain={[40, 100]} />
											<Tooltip 
												contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
												formatter={(value) => [`${value}%`, 'Accuracy']}
											/>
											<Area 
												type="monotone" 
												dataKey="accuracy" 
												stroke="url(#colorAccuracyStroke)" 
												strokeWidth={4} 
												fillOpacity={1} 
												fill="url(#colorAccuracyArea)" 
												activeDot={{ r: 6, strokeWidth: 0 }} 
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</PanelCard>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<motion.div variants={itemVariants} className="h-full">
								<PanelCard title="Topic Performance" subtitle="Accuracy by subject area">
									<div style={{ width: '100%', height: 260 }}>
										<ResponsiveContainer>
											<BarChart data={topicPerformance} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
												<defs>
													<linearGradient id="barGradientGood" x1="0" y1="0" x2="1" y2="0">
														<stop offset="0%" stopColor="#6366f1" />
														<stop offset="100%" stopColor="#a855f7" />
													</linearGradient>
													<linearGradient id="barGradientWarning" x1="0" y1="0" x2="1" y2="0">
														<stop offset="0%" stopColor="#f43f5e" />
														<stop offset="100%" stopColor="#ec4899" />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isLightMode ? '#e2e8f0' : '#334155'} />
												<XAxis type="number" domain={[0, 100]} hide />
												<YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} stroke={isLightMode ? '#64748b' : '#94a3b8'} width={90} />
												<Tooltip 
													cursor={{ fill: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}
													contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
													formatter={(value) => [`${value}%`, 'Score']}
												/>
												<Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
													{topicPerformance.map((item) => (
														<Cell key={item.topic} fill={item.score < 60 ? 'url(#barGradientWarning)' : 'url(#barGradientGood)'} />
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>
								</PanelCard>
							</motion.div>

							<motion.div variants={itemVariants} className="h-full">
								<PanelCard title="Recent Activity" subtitle="Your latest practice sessions">
									<Stack spacing={3} sx={{ mt: 1 }}>
										{recentTests.map((test) => (
											<div key={test.id} className="flex flex-col border-b border-slate-200 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
												<div className="flex items-start justify-between mb-1">
													<Typography variant="body2" sx={{ fontWeight: 800, pr: 2 }}>
														{test.title}
													</Typography>
													<Chip 
														label={test.score} 
														size="small" 
														sx={{ 
															fontWeight: 800, 
															bgcolor: `${toneToColor[test.status as keyof typeof toneToColor]}20`,
															color: toneToColor[test.status as keyof typeof toneToColor],
															borderRadius: '8px'
														}} 
													/>
												</div>
												<div className="flex items-center justify-between">
													<Typography variant="caption" sx={{ color: 'text.secondary' }}>
														{test.time}
													</Typography>
													{test.status === 'needs_review' && (
														<Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
															Needs Review
														</Typography>
													)}
												</div>
											</div>
										))}
									</Stack>
								</PanelCard>
							</motion.div>
						</div>
					</div>

					{/* Right Column (Sidebar Actions - 30%) */}
					<div className="lg:col-span-4 flex flex-col gap-6">
						
						{/* AI Insights Panel (The USP) */}
						<motion.div variants={itemVariants}>
							<Card sx={{ 
								p: 3, 
								position: 'relative',
								overflow: 'hidden',
								'&::before': {
									content: '""',
									position: 'absolute',
									inset: 0,
									background: isLightMode 
										? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
										: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
									zIndex: -1,
								}
							}}>
								{/* Animated Background Decoration */}
								<motion.div 
									animate={{ 
										y: [0, -20, 0], 
										rotate: [0, 10, 0],
										scale: [1, 1.1, 1]
									}} 
									transition={{ 
										duration: 8, 
										repeat: Infinity, 
										ease: "easeInOut" 
									}} 
									className="absolute top-0 right-0 -mt-8 -mr-8 bg-white/20 dark:bg-white/5 w-40 h-40 rounded-full blur-2xl z-0"
								/>
								
								<div className="relative z-10">
									<div className="flex items-center gap-2 mb-4 bg-purple-500/10 dark:bg-purple-500/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-purple-500/20 shadow-sm">
										<motion.div
											animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
											transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
										>
											<BrainCircuit size={18} className="text-purple-600 dark:text-purple-300" />
										</motion.div>
										<Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.primary' }}>AI STUDY COACH</Typography>
									</div>
									
									<Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: 'text.primary', lineHeight: 1.2 }}>
										Let's fix Dynamic Programming.
									</Typography>
									
									<Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6, fontSize: '0.95rem' }}>
										Your accuracy in DP dropped by 12% in the last assessment. I've generated a custom 15-question practice set focusing purely on <strong>Memoization</strong> to help you recover quickly.
									</Typography>
									
									<div className="bg-white/40 dark:bg-black/20 rounded-2xl p-3.5 backdrop-blur-md border border-white/40 dark:border-white/10 mb-5 shadow-inner">
										<div className="flex items-center gap-3">
											<Avatar sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)', color: '#9333ea', width: 36, height: 36 }}>
												<Target size={20} />
											</Avatar>
											<div>
												<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
													Estimated Time
												</Typography>
												<Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
													25 Minutes
												</Typography>
											</div>
										</div>
									</div>
									
									<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
										<Button
											fullWidth
											onClick={() => navigate('/practice/generated')}
											endIcon={<ArrowUpRight size={18} strokeWidth={3} />}
											variant="contained"
											sx={{ 
												background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
												color: 'white', 
												'&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', boxShadow: '0 15px 30px -10px rgba(168,85,247,0.5)' },
												py: 1.8,
												borderRadius: 4,
												fontWeight: 900,
												fontSize: '1rem',
												boxShadow: '0 10px 25px -5px rgba(168,85,247,0.3)'
											}}
										>
											Start Custom Practice
										</Button>
									</motion.div>
								</div>
							</Card>
						</motion.div>

						{/* Quick Actions Array */}
						<motion.div variants={itemVariants}>
							<Card sx={{ p: 3 }}>
								<Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
									Quick Actions
								</Typography>
								<div className="flex flex-col gap-3">
									<motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
										<Button 
											variant="contained" 
											onClick={() => navigate('/practice')}
											startIcon={<Play size={18} />}
											sx={{ py: 1.5, justifyContent: 'flex-start', borderRadius: 3, fontWeight: 800, width: '100%' }}
										>
											Start New Practice
										</Button>
									</motion.div>
									<motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
										<Button 
											variant="outlined" 
											onClick={() => navigate('/test/resume')}
											startIcon={<Clock size={18} />}
											sx={{ py: 1.5, justifyContent: 'flex-start', borderRadius: 3, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 }, width: '100%' }}
										>
											Continue Test
										</Button>
									</motion.div>
									<motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
										<Button 
											variant="text" 
											onClick={() => navigate('/analytics')}
											startIcon={<BarChart3 size={18} />}
											sx={{ py: 1.5, justifyContent: 'flex-start', borderRadius: 3, fontWeight: 800, color: 'text.secondary', bgcolor: 'transparent', '&:hover': { bgcolor: 'action.hover' }, width: '100%' }}
										>
											View Analytics
										</Button>
									</motion.div>
								</div>
							</Card>
						</motion.div>

					</div>
				</div>
			</motion.div>
		</DashboardLayout>
	);
};

export default DashboardPage;
