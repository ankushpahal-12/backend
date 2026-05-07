import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type AISummaryProps = {
	title?: string;
	summary: string;
};

const AISummary = ({ title = 'AI Summary', summary }: AISummaryProps) => {
	return (
		<motion.section
			whileHover={{ y: -4, scale: 1.01 }}
			transition={{ type: 'spring', stiffness: 260, damping: 18 }}
			className="group relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-[0_10px_35px_rgba(79,70,229,0.08)] ring-1 ring-white/60 backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(79,70,229,0.14)]"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-50/70 via-transparent to-violet-50/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
			<div className="relative z-10">
				<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-indigo-700 shadow-sm">
					<Sparkles size={15} />
					<h3 className="text-xs font-black uppercase tracking-[0.18em]">{title}</h3>
				</div>
				<p className="text-sm leading-7 text-slate-600">{summary}</p>
			</div>
		</motion.section>
	);
};

export default AISummary;
