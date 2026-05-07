import { motion } from 'framer-motion';
import { Bot, CircleMinus, CirclePlus, Sparkles } from 'lucide-react';

export type ReasoningPoint = {
	text: string;
	positive: boolean;
};

type AIReasoningProps = {
	points: ReasoningPoint[];
	title?: string;
	showBot?: boolean;
};

const AIReasoning = ({ points, title = 'AI Reasoning', showBot = true }: AIReasoningProps) => {
	return (
		<motion.section
			whileHover={{ y: -4, scale: 1.01 }}
			transition={{ type: 'spring', stiffness: 220, damping: 18 }}
			className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-linear-to-br from-indigo-50 via-violet-50 to-sky-50 p-5 shadow-[0_14px_45px_rgba(79,70,229,0.12)] ring-1 ring-white/70 transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(79,70,229,0.18)]"
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_28%)]" />
			<div className="relative z-10 mb-4 flex items-center justify-between gap-3">
				<div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-indigo-700 shadow-sm backdrop-blur">
					<Bot size={15} />
					<h3 className="text-xs font-black uppercase tracking-[0.18em]">{title}</h3>
				</div>
				<span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
					<Sparkles size={13} /> AI calibrated
				</span>
			</div>

			<div className="relative z-10 space-y-2.5">
				{points.map((point) => (
					<motion.div
						key={point.text}
						whileHover={{ x: 4 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
						className="flex items-start gap-2 rounded-2xl border border-white/70 bg-white/65 px-3 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md"
					>
						<span className={point.positive ? 'text-emerald-600' : 'text-rose-500'}>
							{point.positive ? <CirclePlus size={16} /> : <CircleMinus size={16} />}
						</span>
						<p className="text-sm leading-6 text-slate-700">{point.text}</p>
					</motion.div>
				))}
			</div>

			{showBot ? (
				<div className="pointer-events-none absolute -bottom-3 right-2 text-indigo-300 opacity-90">
					<Bot size={58} strokeWidth={1.5} />
				</div>
			) : null}
		</motion.section>
	);
};

export default AIReasoning;
