import { motion } from 'framer-motion';
import {
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

export type SubjectPerformance = {
	name: string;
	value: number;
	color: string;
};

export type TrendPoint = {
	test: string;
	accuracy: number;
};

type PerformanceChartProps = {
	subjectData: SubjectPerformance[];
	trendData: TrendPoint[];
};

const PerformanceChart = ({ subjectData, trendData }: PerformanceChartProps) => {
	const hasSubjectData = subjectData.length > 0;
	const hasTrendData = trendData.length > 0;

	if (!hasSubjectData || !hasTrendData) {
		return (
			<section className="grid gap-4 lg:grid-cols-2">
				<article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_38px_rgba(15,23,42,0.08)] ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-semibold text-slate-800">Performance charts</p>
					<p className="mt-2 text-sm text-slate-500">Chart data is not available yet.</p>
				</article>
				<article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_38px_rgba(15,23,42,0.08)] ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-semibold text-slate-800">Accuracy trend</p>
					<p className="mt-2 text-sm text-slate-500">Add test history to display the trend line.</p>
				</article>
			</section>
		);
	}

	return (
		<section className="grid gap-4 lg:grid-cols-2">
			<motion.article
				whileHover={{ y: -4 }}
				transition={{ type: 'spring', stiffness: 260, damping: 18 }}
				className="group rounded-3xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-white/60"
			>
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Distribution</p>
						<h3 className="mt-1 text-lg font-black text-slate-900">Performance by Subject</h3>
					</div>
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
						Pie chart
					</span>
				</div>
				<div className="h-60 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={subjectData}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								innerRadius={50}
								outerRadius={75}
								paddingAngle={3}
							>
								{subjectData.map((entry) => (
									<Cell key={entry.name} fill={entry.color} />
								))}
							</Pie>
							<Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</motion.article>

			<motion.article
				whileHover={{ y: -4 }}
				transition={{ type: 'spring', stiffness: 260, damping: 18 }}
				className="group rounded-3xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-violet-50 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-white/60"
			>
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Momentum</p>
						<h3 className="mt-1 text-lg font-black text-slate-900">Accuracy Trend</h3>
					</div>
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
						Line chart
					</span>
				</div>
				<div className="h-60 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={trendData} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
							<XAxis dataKey="test" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
							<YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" axisLine={false} tickLine={false} />
							<Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
							<Line
								type="monotone"
								dataKey="accuracy"
								stroke="#4f46e5"
								strokeWidth={3}
								dot={{ r: 3, fill: '#4f46e5' }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</motion.article>
		</section>
	);
};

export default PerformanceChart;
