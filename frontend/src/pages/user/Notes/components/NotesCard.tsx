import { Bookmark, Edit3, Eye, MoreVertical, Pin, Star } from 'lucide-react';
import { BACKGROUND_CLASS_MAP } from '../constants';
import { formatRelativeTime } from '../utils/formatDate';
import type { NoteCardProps } from '../types/types';

const NotesCard = ({ note, onOpen, onOpenFullPage, onToggleFavorite, onTogglePublic }: NoteCardProps) => {
	return (
		<article
			className={`group rounded-3xl border border-slate-200/80 ${BACKGROUND_CLASS_MAP[note.background]} p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]`}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">{note.topic}</span>
						{note.isFavorite ? <Star size={14} className="text-amber-500" /> : null}
					</div>
					<h3 className="mt-3 text-base font-bold text-slate-900">{note.title}</h3>
					<p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{note.content}</p>
				</div>
				<button className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
					<MoreVertical size={16} />
				</button>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{note.tags.map((tag) => (
					<span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm">#{tag}</span>
				))}
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/70 pt-3 text-xs text-slate-500">
				<span>{formatRelativeTime(note.updatedAt)}</span>
				<div className="flex flex-wrap items-center gap-2">
					<button onClick={() => onOpen?.(note)} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100" aria-label="Quick edit note">
						<Edit3 size={13} /> Quick Edit
					</button>
					<button onClick={() => onOpenFullPage?.(note)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50" aria-label="Open full page editor">
						<Pin size={13} /> Full Page
					</button>
					<button onClick={() => onToggleFavorite?.(note.id)} className="rounded-full p-2 transition hover:bg-white" aria-label="Toggle favorite">
						<Star size={15} className={note.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'} />
					</button>
					<button onClick={() => onTogglePublic?.(note.id)} className="rounded-full p-2 transition hover:bg-white" aria-label="Toggle public">
						{note.isPublic ? <Eye size={15} className="text-emerald-600" /> : <Bookmark size={15} className="text-slate-400" />}
					</button>
					<button onClick={() => onOpen?.(note)} className="rounded-full p-2 transition hover:bg-white" aria-label="Open quick edit">
						<Pin size={15} className="text-slate-400" />
					</button>
				</div>
			</div>
		</article>
	);
};

export default NotesCard;
