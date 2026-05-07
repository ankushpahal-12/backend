export const formatDateTime = (date = new Date()) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'long',
    }).format(date);
};

export const getCurrentTime = () => {
    return formatDateTime(new Date());
};
