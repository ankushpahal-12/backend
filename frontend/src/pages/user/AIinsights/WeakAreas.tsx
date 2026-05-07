import { motion } from 'framer-motion';
import { ArrowDownRight, AlertCircle } from 'lucide-react';

export type WeakAreaItem = {
	topic: string;
	accuracy: number;
};

type WeakAreasProps = {
	items: WeakAreaItem[];
	title?: string;
};

const WeakAreas = ({ items, title = 'Weak Areas' }: WeakAreasProps) => {
	return (
		<motion.section
			whileHover={{ y: -3 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			className="group rounded-3xl border border-rose-100/80 bg-linear-to-br from-rose-50 via-white to-orange-50 p-5 shadow-[0_12px_40px_rgba(244,63,94,0.08)] ring-1 ring-white/70 transition-shadow duration-300 hover:shadow-[0_18px_52px_rgba(244,63,94,0.14)]"
		>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">Attention required</p>
					<h3 className="mt-1 text-lg font-black text-slate-900">{title}</h3>
				</div>
				<span className="rounded-full border border-rose-100 bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm">
					Needs review
				</span>
			</div>

			<div className="space-y-3">
				{items.map((item) => (
					<motion.article
						key={item.topic}
						whileHover={{ y: -2, x: 2 }}
						transition={{ type: 'spring', stiffness: 350, damping: 20 }}
						className="flex items-start justify-between rounded-2xl border border-rose-100/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div className="flex gap-2.5">
							<span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
								<AlertCircle size={16} />
							</span>
							<div>
								<p className="text-sm font-semibold text-slate-900">{item.topic}</p>
								<p className="text-xs text-slate-600">Accuracy: {item.accuracy}%</p>
							</div>
						</div>
						<span className="mt-1 rounded-full bg-rose-50 p-1.5 text-rose-500 ring-1 ring-rose-100">
							<ArrowDownRight size={16} />
						</span>
					</motion.article>
				))}
			</div>
		</motion.section>
	);
};

export default WeakAreas;
