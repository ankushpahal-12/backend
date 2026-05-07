import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layouts/MainLayout';
import NotesEditor from './NotesEditor';
import NotesHeader from './components/NotesHeader';
import { useEditor } from './hooks/useEditor';
import { useNotes } from './hooks/useNotes';
import type { NoteBackground, NoteEditorDraft, NoteTopic } from './types/types';

const NotesEditorPage = () => {
	const { noteId } = useParams();
	const navigate = useNavigate();
	const { selectedNote, selectNote, createNote, updateNote } = useNotes();
	const editor = useEditor(selectedNote);

	useEffect(() => {
		if (!noteId || noteId === 'new') {
			selectNote(null);
			return;
		}

		selectNote(noteId);
	}, [noteId, selectNote]);

	const activeNoteId = useMemo(() => selectedNote?.id ?? null, [selectedNote]);

	const saveNote = () => {
		const draft: Omit<NoteEditorDraft, never> = editor.draft;
		if (activeNoteId) {
			updateNote(activeNoteId, {
				title: draft.title || 'Untitled Note',
				content: draft.content,
				topic: draft.topic,
				subtopic: draft.subtopic,
				tags: draft.tags,
				isFavorite: draft.isFavorite,
				isPublic: draft.isPublic,
				background: draft.background,
			});
			return activeNoteId;
		}

		const next = createNote({
			title: draft.title || 'Untitled Note',
			content: draft.content,
			topic: draft.topic,
			subtopic: draft.subtopic,
			tags: draft.tags,
			isFavorite: draft.isFavorite,
			isPublic: draft.isPublic,
			background: draft.background,
		});
		navigate(`/notes/editor/${next.id}`, { replace: true });
		return next.id;
	};

	const updateDraftField = <K extends keyof NoteEditorDraft>(field: K, value: NoteEditorDraft[K]) => {
		editor.updateField(field, value);
	};

	return (
		<MainLayout>
			<div className="-mx-6 -my-6 space-y-6 lg:-mx-10 lg:-my-10">
				<NotesHeader
					title="Deep Work"
					subtitle="A full-page editor for longer writing, reviewing and restructuring notes."
					onNewNote={() => navigate('/notes/editor/new')}
				/>

				<div className="w-full rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-0">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-6 lg:px-10">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Focused writing mode</p>
							<h2 className="mt-1 text-2xl font-black text-slate-900">{activeNoteId ? 'Edit note' : 'Create note'}</h2>
						</div>
						<button
							onClick={() => navigate('/notes')}
							className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
						>
							Back to notes
						</button>
					</div>

					<div className="px-0">
						<NotesEditor
							draft={editor.draft}
							onTitleChange={(value) => updateDraftField('title', value)}
							onContentChange={(value) => updateDraftField('content', value)}
							onTopicChange={(value: NoteTopic) => updateDraftField('topic', value)}
							onSubtopicChange={(value) => updateDraftField('subtopic', value)}
							onBackgroundChange={(value: NoteBackground) => updateDraftField('background', value)}
							onToggleFavorite={() => updateDraftField('isFavorite', !editor.draft.isFavorite)}
							onTogglePublic={() => updateDraftField('isPublic', !editor.draft.isPublic)}
							onAddTag={editor.addTag}
							onRemoveTag={editor.removeTag}
							onSave={saveNote}
							onCancel={() => navigate('/notes')}
						/>
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

export default NotesEditorPage;
