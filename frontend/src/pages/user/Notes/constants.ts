import type { Note, NoteBackground, NoteTopic } from './types/types';

export const NOTES_STORAGE_KEY = 'studyMate.notes.v1';

export const NOTE_TOPICS: NoteTopic[] = ['Biology', 'Chemistry', 'Physics', 'Maths'];

export const NOTE_BACKGROUNDS: Array<{ value: NoteBackground; label: string; color: string }> = [
	{ value: 'default', label: 'Default', color: '#ffffff' },
	{ value: 'yellow', label: 'Warm', color: '#fff7d6' },
	{ value: 'green', label: 'Mint', color: '#eaf9ec' },
	{ value: 'blue', label: 'Sky', color: '#eaf2ff' },
	{ value: 'purple', label: 'Lavender', color: '#f2eefe' },
	{ value: 'pink', label: 'Rose', color: '#fdebf3' },
];

export const EMPTY_NOTE_DRAFT = {
	title: '',
	content: '',
	topic: 'Biology' as NoteTopic,
	subtopic: '',
	tags: [] as string[],
	isFavorite: false,
	isPublic: false,
	background: 'default' as NoteBackground,
};

export const SAMPLE_NOTES: Note[] = [
	{
		id: 'note-1',
		title: 'Mitochondria',
		content: 'Mitochondria is the powerhouse of the cell. It produces ATP and supports cellular respiration.',
		topic: 'Biology',
		subtopic: 'Cell Biology',
		tags: ['Mitochondria', 'Cell', 'ATP'],
		isFavorite: true,
		isPublic: false,
		background: 'purple',
		createdAt: new Date('2026-04-26T09:30:00').toISOString(),
		updatedAt: new Date('2026-05-02T08:15:00').toISOString(),
	},
	{
		id: 'note-2',
		title: 'Photosynthesis Basics',
		content: 'Chlorophyll captures light and helps plants convert energy into glucose.',
		topic: 'Biology',
		subtopic: 'Plant Biology',
		tags: ['Chlorophyll', 'Energy'],
		isFavorite: false,
		isPublic: true,
		background: 'green',
		createdAt: new Date('2026-04-30T10:05:00').toISOString(),
		updatedAt: new Date('2026-05-01T13:10:00').toISOString(),
	},
	{
		id: 'note-3',
		title: 'Organic Chemistry Reactions',
		content: 'Focus on naming reactions, identifying functional groups, and practicing mechanisms.',
		topic: 'Chemistry',
		subtopic: 'Organic Chemistry',
		tags: ['Reactions', 'Mechanisms'],
		isFavorite: true,
		isPublic: false,
		background: 'blue',
		createdAt: new Date('2026-04-21T12:10:00').toISOString(),
		updatedAt: new Date('2026-04-29T16:25:00').toISOString(),
	},
];

export const BACKGROUND_CLASS_MAP: Record<NoteBackground, string> = {
	default: 'bg-white',
	yellow: 'bg-amber-50',
	green: 'bg-emerald-50',
	blue: 'bg-sky-50',
	purple: 'bg-violet-50',
	pink: 'bg-rose-50',
};
