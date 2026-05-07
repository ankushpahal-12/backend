export const formatDate = (value: string | number | Date) => {
	const date = new Date(value);
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
};

export const formatRelativeTime = (value: string | number | Date) => {
	const date = new Date(value);
	const diffMs = Date.now() - date.getTime();
	const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.round(diffHours / 24);
	return `${diffDays}d ago`;
};
