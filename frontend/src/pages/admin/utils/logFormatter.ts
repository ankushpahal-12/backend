/**
 * Utility functions for formatting logs and dates in the Admin Support UI.
 */

export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const syntaxHighlightJson = (json: any): string => {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match: string) {
    let cls = 'text-blue-500'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-indigo-600 font-semibold'; // key
      } else {
        cls = 'text-emerald-600'; // string
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-amber-500 font-bold'; // boolean
    } else if (/null/.test(match)) {
      cls = 'text-slate-400 italic'; // null
    }
    return `<span class="${cls}">${match}</span>`;
  });
};
