import { BookOpen, Globe2, LayoutGrid, Star, Tag } from 'lucide-react';
import { NOTE_BACKGROUNDS, NOTE_TOPICS } from '../constants';
import TagInput from '../components/TagInput';
import type { NoteBackground, NoteTopic, NoteEditorDraft } from '../types/types';

type MetadataPanelProps = {
	draft: NoteEditorDraft;
	onTopicChange: (topic: NoteTopic) => void;
	onSubtopicChange: (value: string) => void;
	onBackgroundChange: (background: NoteBackground) => void;
	onToggleFavorite: () => void;
	onTogglePublic: () => void;
	onAddTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
};

const MetadataPanel = ({
	draft,
	onTopicChange,
	onSubtopicChange,
	onBackgroundChange,
	onToggleFavorite,
	onTogglePublic,
	onAddTag,
	onRemoveTag,
}: MetadataPanelProps) => {
	return (
		<aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
			<section>
				<div className="mb-3 flex items-center gap-2 text-slate-900">
					<BookOpen size={16} />
					<h3 className="text-sm font-bold">Note Details</h3>
				</div>

				<div className="space-y-3 text-sm">
					<label className="block">
						<span className="mb-1 block text-slate-500">Topic</span>
						<select value={draft.topic} onChange={(event) => onTopicChange(event.target.value as NoteTopic)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none">
							{NOTE_TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
						</select>
					</label>

					<label className="block">
						<span className="mb-1 block text-slate-500">Subtopic (Optional)</span>
						<input value={draft.subtopic} onChange={(event) => onSubtopicChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none" placeholder="Cell Biology" />
					</label>

					<div>
						<div className="mb-1 flex items-center gap-2 text-slate-500"><Tag size={15} /> Tags</div>
						<TagInput tags={draft.tags} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
					</div>
				</div>
			</section>

			<section>
				<div className="mb-3 flex items-center gap-2 text-slate-900"><LayoutGrid size={16} /><h3 className="text-sm font-bold">Quick Options</h3></div>
				<div className="space-y-2 text-sm text-slate-700">
					<button
						type="button"
						onClick={onToggleFavorite}
						aria-pressed={draft.isFavorite}
						className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition hover:bg-slate-50 ${
							draft.isFavorite ? 'border-indigo-200 bg-indigo-50/70' : 'border-slate-200 bg-white'
						}`}
					>
						<span className="flex items-center gap-2 font-medium text-slate-700"><Star size={14} /> Favorite Note</span>
						<span className={`relative h-6 w-11 rounded-full transition ${draft.isFavorite ? 'bg-indigo-600' : 'bg-slate-200'}`}>
							<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draft.isFavorite ? 'left-5' : 'left-0.5'}`} />
						</span>
					</button>
					<button
						type="button"
						onClick={onTogglePublic}
						aria-pressed={draft.isPublic}
						className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition hover:bg-slate-50 ${
							draft.isPublic ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'
						}`}
					>
						<span className="flex items-center gap-2 font-medium text-slate-700"><Globe2 size={14} /> Make Public</span>
						<span className={`relative h-6 w-11 rounded-full transition ${draft.isPublic ? 'bg-emerald-600' : 'bg-slate-200'}`}>
							<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draft.isPublic ? 'left-5' : 'left-0.5'}`} />
						</span>
					</button>
				</div>
			</section>

			<section>
				<div className="mb-3 flex items-center gap-2 text-slate-900"><Globe2 size={16} /><h3 className="text-sm font-bold">Note Background</h3></div>
				<div className="flex flex-wrap gap-2">
					{NOTE_BACKGROUNDS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => onBackgroundChange(option.value)}
							className={`h-10 w-10 rounded-2xl border transition ${draft.background === option.value ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
							style={{ backgroundColor: option.color }}
							title={option.label}
							aria-label={option.label}
						/>
					))}
				</div>
			</section>
		</aside>
	);
};

export default MetadataPanel;
