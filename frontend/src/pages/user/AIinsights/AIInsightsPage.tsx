import { useMemo, useState } from 'react';
import {
	BarChart3,
	CheckCircle2,
	ChevronDown,
	Clock3,
	Medal,
	Target,
	Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import MainLayout from '../../../components/layouts/MainLayout';
import AISummary from './AISummary';
import AIReasoning from './AIReasoning';
import AIRecommendations from './AIRecommendations';
import PerformanceChart from './PerformanceChart';
import Strengths from './Strengths';
import WeakAreas from './WeakAreas';

type TestKey = 'biology';

const tests: Record<TestKey, string> = {
	biology: 'Biology Practice Test',
};

const stats = [
	{
		title: 'Accuracy',
		value: '80%',
		hint: 'Great',
		icon: CheckCircle2,
		tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
	},
	{
		title: 'Percentile',
		value: '72%',
		hint: 'Top 28%',
		icon: Medal,
		tone: 'text-indigo-600 bg-indigo-50 border-indigo-100',
	},
	{
		title: 'Time Taken',
		value: '12m 45s',
		hint: 'Good pace',
		icon: Clock3,
		tone: 'text-sky-600 bg-sky-50 border-sky-100',
	},
	{
		title: 'Questions Attempted',
		value: '20 / 20',
		hint: 'All attempted',
		icon: Target,
		tone: 'text-amber-600 bg-amber-50 border-amber-100',
	},
];

const subjectData = [
	{ name: 'Physics', value: 90, color: '#16a34a' },
	{ name: 'Chemistry', value: 75, color: '#2563eb' },
	{ name: 'Biology', value: 60, color: '#f59e0b' },
	{ name: 'Maths', value: 85, color: '#7c3aed' },
];

const trendData = [
	{ test: 'Test 1', accuracy: 40 },
	{ test: 'Test 2', accuracy: 70 },
	{ test: 'Test 3', accuracy: 64 },
	{ test: 'Test 4', accuracy: 78 },
	{ test: 'Latest', accuracy: 88 },
];

const strengths = [
	{
		title: 'Strong in Physics',
		description: 'Accuracy: 90%',
		metric: 'Low variation in scores',
		showTrend: true,
	},
	{
		title: 'Good Time Management',
		description: 'Avg. time per question: 38s',
		metric: 'Within optimal range',
		showTrend: true,
	},
	{
		title: 'Consistent Performance',
		description: 'Balanced score progression',
		metric: 'Improving trend',
		showTrend: true,
	},
];

const weakAreas = [
	{ topic: 'Biology Concepts', accuracy: 60 },
	{ topic: 'Theoretical Questions', accuracy: 55 },
	{ topic: 'Diagram Based Questions', accuracy: 50 },
];

const recommendations = [
	{
		title: 'Focus on Biology',
		description: 'Practice more cell biology, genetics and ecology topics.',
	},
	{
		title: 'Practice Weak Questions',
		description: 'Retry incorrect and skipped questions to improve accuracy.',
	},
	{
		title: 'Take More Mock Tests',
		description: 'Build speed and consistency with timed full-length mocks.',
	},
];

const AIInsightsPage = () => {
	const [selectedTest, setSelectedTest] = useState<TestKey>('biology');
	const [mobileView, setMobileView] = useState<'overview' | 'report'>('overview');

	const summaryText = useMemo(
		() =>
			'You scored 16 out of 20 with 80% accuracy. Your performance was strong overall with excellent output in Physics and Maths, while Biology still needs more practice. Your time management stayed in a healthy range throughout the test.',
		[],
	);

	const reasoningPoints = useMemo(
		() => [
			{ text: 'Your strong score in Physics significantly boosted your final result.', positive: true },
			{ text: 'Lower accuracy in Biology topics reduced your total performance.', positive: false },
			{ text: 'You attempted all questions with good pacing and no time drop-off.', positive: true },
		],
		[],
	);

	const overviewPanel = (
		<div className="space-y-4">
			<section className="group rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-violet-50 to-sky-50 p-5 shadow-[0_12px_40px_rgba(79,70,229,0.08)] ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(79,70,229,0.18)] hover:ring-indigo-200/70">
				<div className="mb-3 flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Overall Performance</p>
						<p className="text-4xl font-black text-slate-900">80%</p>
						<p className="text-sm font-medium text-emerald-600">Good Performance</p>
					</div>
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
						<Trophy size={24} />
					</div>
				</div>

				<div>
					<div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
						<span>Your Score: 16 / 20</span>
						<span>80%</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-white/80">
						<div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-indigo-500" style={{ width: '80%' }} />
					</div>
				</div>
			</section>

			<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((item) => {
					const Icon = item.icon;
					return (
						<article
							key={item.title}
							className={`group rounded-2xl border p-4 ${item.tone} bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] hover:ring-indigo-200/70`}
						>
							<div className="mb-2 inline-flex rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-105">
								<Icon size={16} />
							</div>
							<p className="text-xs font-semibold text-slate-500">{item.title}</p>
							<p className="text-2xl font-black text-slate-900">{item.value}</p>
							<p className="text-xs font-semibold text-emerald-600">{item.hint}</p>
						</article>
					);
				})}
			</section>

			<PerformanceChart subjectData={subjectData} trendData={trendData} />

			<AISummary summary={summaryText} />

			<section className="grid gap-4 xl:grid-cols-2">
				<Strengths items={strengths} title="Top Strengths" />
				<WeakAreas items={weakAreas} title="Areas to Improve" />
			</section>
		</div>
	);

	const reportPanel = (
			<section className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_38px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] hover:ring-indigo-200/50">
			<div className="mb-4 flex items-center justify-between gap-2">
				<div>
					<h2 className="text-2xl font-black text-slate-900">AI Insight Report</h2>
					<p className="text-sm text-slate-500">Detailed AI analysis of your performance</p>
				</div>
				<button className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md active:translate-y-0">
					Download Report
				</button>
			</div>

			<div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
				<p className="text-sm font-semibold text-slate-800">{tests[selectedTest]}</p>
				<p className="text-xs text-slate-500">20 Questions • Medium • Completed on 12 May 2024</p>
			</div>

			<div className="mb-4 grid grid-cols-4 gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-500">
				<span className="rounded-lg bg-indigo-50 px-2 py-1 text-center text-indigo-600 shadow-sm transition-all duration-300 hover:bg-indigo-100">Overview</span>
				<span className="rounded-lg px-2 py-1 text-center transition-all duration-300 hover:bg-slate-50 hover:text-slate-700">Strengths</span>
				<span className="rounded-lg px-2 py-1 text-center transition-all duration-300 hover:bg-slate-50 hover:text-slate-700">Question Analysis</span>
				<span className="rounded-lg px-2 py-1 text-center transition-all duration-300 hover:bg-slate-50 hover:text-slate-700">Recommendations</span>
			</div>

			<div className="space-y-4">
				<AISummary summary={summaryText} />
				<section className="grid gap-4 lg:grid-cols-2">
					<Strengths items={strengths} />
					<WeakAreas items={weakAreas} />
				</section>
				<AIReasoning points={reasoningPoints} />
				<AIRecommendations items={recommendations} />
				<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(79,70,229,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(79,70,229,0.32)] active:translate-y-0">
					<BarChart3 size={16} />
					Start Practice for Weak Areas
				</button>
			</div>
		</section>
	);

	return (
		<MainLayout>
			<div className="relative mx-auto max-w-7xl space-y-6">
				<div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_28%)]" />
				<header className="relative overflow-hidden rounded-4xl border border-white/70 bg-white/75 p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
					<div className="absolute inset-0 bg-linear-to-r from-indigo-50/50 via-transparent to-cyan-50/40" />
					<div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
						<div className="space-y-2">
							<h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">AI Insights</h1>
							<p className="max-w-2xl text-sm leading-6 text-slate-600">
								Smart analysis of your performance with clearer strengths, weaker topics, and a smoother path to improvement.
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
								<button
									onClick={() => setMobileView('overview')}
									className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
										mobileView === 'overview'
											? 'bg-indigo-600 text-white shadow-md'
											: 'text-slate-600 hover:bg-slate-50'
									}`}
								>
									Overview
								</button>
								<button
									onClick={() => setMobileView('report')}
									className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
										mobileView === 'report'
											? 'bg-indigo-600 text-white shadow-md'
											: 'text-slate-600 hover:bg-slate-50'
									}`}
								>
									Report
								</button>
							</div>

							<label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:border-indigo-300">
								<select
									value={selectedTest}
									onChange={(event) => setSelectedTest(event.target.value as TestKey)}
									className="appearance-none bg-transparent pr-1 font-medium outline-none"
									aria-label="Select practice test"
								>
									{Object.entries(tests).map(([key, label]) => (
										<option key={key} value={key}>
											{label}
										</option>
									))}
								</select>
								<ChevronDown size={14} className="text-slate-400" />
							</label>
						</div>
					</div>
				</header>

				<div className="xl:hidden">
					<div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
						{[
							{ key: 'overview', label: 'Overview' },
							{ key: 'report', label: 'Report' },
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => setMobileView(tab.key as 'overview' | 'report')}
								className={`min-w-27.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
									mobileView === tab.key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					<motion.div
						key={mobileView}
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
					>
						{mobileView === 'overview' ? overviewPanel : reportPanel}
					</motion.div>
				</div>

				<div className="hidden gap-5 xl:grid xl:grid-cols-[1.03fr_0.97fr]">
					<motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
						<div className="sticky top-6">{overviewPanel}</div>
					</motion.div>
					<motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
						<div className="sticky top-6">{reportPanel}</div>
					</motion.div>
				</div>
			</div>
		</MainLayout>
	);
};

export default AIInsightsPage;
