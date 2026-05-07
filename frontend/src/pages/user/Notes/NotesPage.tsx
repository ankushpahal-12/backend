import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layouts/MainLayout';
import NotesEditor from './NotesEditor';
import NotesHeader from './components/NotesHeader';
import NotesView from './NotesView';
import Modal from '../../../components/ui/Modal';
import { useEditor } from './hooks/useEditor';
import { useNotes } from './hooks/useNotes';
import type { NoteBackground, NoteEditorDraft, NoteTopic } from './types/types';

const NotesPage = () => {
	const {
		notes,
		filteredNotes,
		selectedNote,
		filters,
		setFilters,
		setTopicFilter,
		selectNote,
		createNote,
		updateNote,
		toggleFavorite,
		togglePublic,
	} = useNotes();
	const navigate = useNavigate();

	const editor = useEditor(selectedNote);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

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
		selectNote(next.id);
		return next.id;
	};

	const openEditor = (noteId: string | null) => {
		selectNote(noteId);
		setIsEditorOpen(true);
	};

	const handleCreateNew = () => openEditor(null);

	const handleOpenNote = (noteId: string) => openEditor(noteId);

	const handleOpenNoteFullPage = (noteId: string) => {
		selectNote(noteId);
		navigate(`/notes/editor/${noteId}`);
	};

	const handleCloseEditor = () => setIsEditorOpen(false);

	const openDeepWorkEditor = () => {
		const noteId = saveNote();
		navigate(noteId ? `/notes/editor/${noteId}` : '/notes/editor/new');
		setIsEditorOpen(false);
	};

	const updateDraftField = <K extends keyof NoteEditorDraft>(field: K, value: NoteEditorDraft[K]) => {
		editor.updateField(field, value);
	};

	return (
		<MainLayout>
			<div className="mx-auto max-w-7xl space-y-6">
				<NotesHeader title="Notes" subtitle="Create, organize and manage your study notes easily." onNewNote={handleCreateNew} />

				<NotesView
					notes={filteredNotes}
					filters={filters}
					onFiltersChange={setFilters}
					onTopicChange={setTopicFilter}
					onOpen={(note) => handleOpenNote(note.id)}
					onOpenFullPage={(note) => handleOpenNoteFullPage(note.id)}
					onToggleFavorite={toggleFavorite}
					onTogglePublic={togglePublic}
					onCreate={handleCreateNew}
				/>

				<Modal
					open={isEditorOpen}
					onClose={handleCloseEditor}
					title={activeNoteId ? 'Quick edit note' : 'Quick create note'}
					maxWidth="lg"
					actions={
						<div className="flex flex-wrap items-center justify-end gap-2">
							<button
								onClick={handleCloseEditor}
								className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
							>
								Close
							</button>
							<button
								onClick={openDeepWorkEditor}
								className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
							>
								Open full page
							</button>
							<button
								onClick={() => {
									saveNote();
									handleCloseEditor();
								}}
								className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
							>
								Save Note
							</button>
						</div>
					}
				>
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
					/>
				</Modal>
			</div>
		</MainLayout>
	);
};

export default NotesPage;
