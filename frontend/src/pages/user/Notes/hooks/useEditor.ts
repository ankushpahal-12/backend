import { useEffect, useState } from 'react';
import { EMPTY_NOTE_DRAFT } from '../constants';
import type { Note, NoteEditorDraft } from '../types/types';

export const useEditor = (note: Note | null) => {
	const [draft, setDraft] = useState<NoteEditorDraft>(EMPTY_NOTE_DRAFT);

	useEffect(() => {
		if (!note) {
			setDraft(EMPTY_NOTE_DRAFT);
			return;
		}
		setDraft({
			title: note.title,
			content: note.content,
			topic: note.topic,
			subtopic: note.subtopic ?? '',
			tags: note.tags,
			isFavorite: note.isFavorite,
			isPublic: note.isPublic,
			background: note.background,
		});
	}, [note]);

	const updateField = <K extends keyof NoteEditorDraft>(field: K, value: NoteEditorDraft[K]) => {
		setDraft((current) => ({ ...current, [field]: value }));
	};

	const addTag = (tag: string) => {
		const trimmed = tag.trim();
		if (!trimmed) return;
		setDraft((current) =>
			current.tags.includes(trimmed) ? current : { ...current, tags: [...current.tags, trimmed] },
		);
	};

	const removeTag = (tag: string) => {
		setDraft((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
	};

	const resetDraft = () => setDraft(EMPTY_NOTE_DRAFT);

	return {
		draft,
		setDraft,
		updateField,
		addTag,
		removeTag,
		resetDraft,
	};
};
