import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export type StrengthItem = {
	title: string;
	description: string;
	metric?: string;
	showTrend?: boolean;
};

type StrengthsProps = {
	items: StrengthItem[];
	title?: string;
};

const Strengths = ({ items, title = 'Strengths' }: StrengthsProps) => {
	return (
		<motion.section
			whileHover={{ y: -3 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			className="group rounded-3xl border border-emerald-100/80 bg-linear-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-[0_12px_40px_rgba(16,185,129,0.08)] ring-1 ring-white/70 transition-shadow duration-300 hover:shadow-[0_18px_52px_rgba(16,185,129,0.14)]"
		>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Performance highlights</p>
					<h3 className="mt-1 text-lg font-black text-slate-900">{title}</h3>
				</div>
				<span className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
					High confidence
				</span>
			</div>

			<div className="space-y-3">
				{items.map((item) => (
					<motion.article
						key={item.title}
						whileHover={{ y: -2, x: 2 }}
						transition={{ type: 'spring', stiffness: 350, damping: 20 }}
						className="flex items-start justify-between rounded-2xl border border-emerald-100/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div className="flex gap-2.5">
							<span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
								<CheckCircle2 size={16} />
							</span>
							<div>
								<p className="text-sm font-semibold text-slate-900">{item.title}</p>
								<p className="text-xs leading-5 text-slate-600">{item.description}</p>
								{item.metric ? <p className="mt-1 text-xs font-semibold text-emerald-700">{item.metric}</p> : null}
							</div>
						</div>
						{item.showTrend ? (
							<span className="mt-1 rounded-full bg-emerald-50 p-1.5 text-emerald-600 ring-1 ring-emerald-100">
								<ArrowUpRight size={16} />
							</span>
						) : null}
					</motion.article>
				))}
			</div>
		</motion.section>
	);
};

export default Strengths;
