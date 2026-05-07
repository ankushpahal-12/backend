import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { NOTE_TOPICS } from '../constants';
import type { NoteTopic, NotesFilter } from '../types/types';

type NotesFiltersProps = {
	filters: NotesFilter;
	onChange: (filters: NotesFilter) => void;
	onTopicChange: (topic: NoteTopic | 'All') => void;
};

const NotesFilters = ({ filters, onChange, onTopicChange }: NotesFiltersProps) => {
	return (
		<div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div className="relative flex-1">
					<Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						value={filters.search}
						onChange={(event) => onChange({ ...filters, search: event.target.value })}
						placeholder="Search notes..."
						className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
					/>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
						<SlidersHorizontal size={15} />
						<select
							value={filters.topic}
							onChange={(event) => onTopicChange(event.target.value as NoteTopic | 'All')}
							className="bg-transparent outline-none"
						>
							<option value="All">All Topics</option>
							{NOTE_TOPICS.map((topic) => (
								<option key={topic} value={topic}>{topic}</option>
							))}
						</select>
					</div>

					<button
						onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
						className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
							filters.favoritesOnly
								? 'bg-indigo-600 text-white shadow-md'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
						}`}
					>
						<Star size={15} /> Favorites
					</button>
				</div>
			</div>
		</div>
	);
};

export default NotesFilters;
