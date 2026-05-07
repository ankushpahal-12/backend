import { useEffect, useMemo, useState } from 'react';
import { NOTES_STORAGE_KEY, SAMPLE_NOTES } from '../constants';
import type { Note, NotesFilter, NoteTopic } from '../types/types';

const DEFAULT_FILTERS: NotesFilter = {
	search: '',
	topic: 'All',
	favoritesOnly: false,
};

const loadNotes = () => {
	if (typeof window === 'undefined') return SAMPLE_NOTES;
	const stored = window.localStorage.getItem(NOTES_STORAGE_KEY);
	if (!stored) return SAMPLE_NOTES;
	try {
		const parsed = JSON.parse(stored) as Note[];
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_NOTES;
	} catch {
		return SAMPLE_NOTES;
	}
};

export const useNotes = () => {
	const [notes, setNotes] = useState<Note[]>(loadNotes);
	const [selectedNoteId, setSelectedNoteId] = useState<string | null>(loadNotes()[0]?.id ?? null);
	const [filters, setFilters] = useState<NotesFilter>(DEFAULT_FILTERS);

	useEffect(() => {
		window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
	}, [notes]);

	const filteredNotes = useMemo(() => {
		const search = filters.search.trim().toLowerCase();
		return notes.filter((note) => {
			const matchesSearch = !search || [note.title, note.content, note.topic, note.subtopic, ...note.tags].join(' ').toLowerCase().includes(search);
			const matchesTopic = filters.topic === 'All' || note.topic === filters.topic;
			const matchesFavorites = !filters.favoritesOnly || note.isFavorite;
			return matchesSearch && matchesTopic && matchesFavorites;
		});
	}, [filters, notes]);

	const selectedNote = useMemo(() => notes.find((note) => note.id === selectedNoteId) ?? null, [notes, selectedNoteId]);

	const selectNote = (noteId: string | null) => setSelectedNoteId(noteId);

	const createNote = (draft: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
		const now = new Date().toISOString();
		const nextNote: Note = { ...draft, id: `note-${Date.now()}`, createdAt: now, updatedAt: now };
		setNotes((current) => [nextNote, ...current]);
		setSelectedNoteId(nextNote.id);
		return nextNote;
	};

	const updateNote = (noteId: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
		setNotes((current) =>
			current.map((note) =>
				note.id === noteId
					? { ...note, ...patch, updatedAt: new Date().toISOString() }
					: note,
			),
		);
	};

	const deleteNote = (noteId: string) => {
		setNotes((current) => current.filter((note) => note.id !== noteId));
		setSelectedNoteId((current) => (current === noteId ? null : current));
	};

	const toggleFavorite = (noteId: string) => {
		updateNote(noteId, {
			isFavorite: !notes.find((note) => note.id === noteId)?.isFavorite,
		});
	};

	const togglePublic = (noteId: string) => {
		updateNote(noteId, {
			isPublic: !notes.find((note) => note.id === noteId)?.isPublic,
		});
	};

	const setTopicFilter = (topic: NoteTopic | 'All') => {
		setFilters((current) => ({ ...current, topic }));
	};

	return {
		notes,
		filteredNotes,
		selectedNote,
		filters,
		setFilters,
		setTopicFilter,
		selectNote,
		createNote,
		updateNote,
		deleteNote,
		toggleFavorite,
		togglePublic,
	};
};
