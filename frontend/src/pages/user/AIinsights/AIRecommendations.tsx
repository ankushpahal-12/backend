import { motion } from 'framer-motion';
import { ChevronRight, ClipboardCheck, Sparkles } from 'lucide-react';

export type RecommendationItem = {
	title: string;
	description: string;
};

type AIRecommendationsProps = {
	items: RecommendationItem[];
	title?: string;
};

const AIRecommendations = ({ items, title = 'AI Recommendations' }: AIRecommendationsProps) => {
	return (
		<motion.section
			whileHover={{ y: -3 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			className="rounded-3xl border border-amber-100/80 bg-linear-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_12px_40px_rgba(245,158,11,0.08)] ring-1 ring-white/70 transition-shadow duration-300 hover:shadow-[0_18px_52px_rgba(245,158,11,0.14)]"
		>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Action plan</p>
					<h3 className="mt-1 text-lg font-black text-slate-900">{title}</h3>
				</div>
				<span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-white px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
					<Sparkles size={13} /> Smart next steps
				</span>
			</div>
			<div className="space-y-3">
				{items.map((item) => (
					<motion.article
						key={item.title}
						whileHover={{ y: -2, x: 2 }}
						transition={{ type: 'spring', stiffness: 350, damping: 22 }}
						className="flex items-center justify-between rounded-2xl border border-amber-100/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div className="flex items-start gap-2.5">
							<span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
								<ClipboardCheck size={16} />
							</span>
							<div>
								<p className="text-sm font-semibold text-slate-900">{item.title}</p>
								<p className="text-xs leading-5 text-slate-600">{item.description}</p>
							</div>
						</div>
							<span className="rounded-full bg-slate-50 p-1.5 text-slate-400 ring-1 ring-slate-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-slate-500">
							<ChevronRight size={16} />
						</span>
					</motion.article>
				))}
			</div>
		</motion.section>
	);
};

export default AIRecommendations;
