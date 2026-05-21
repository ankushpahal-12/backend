import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
}

export function sanitizeHTML(
  html: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
    allowedAttributes = ['href', 'title'],
    maxLength = 1000,
  } = options;

  // Truncate if too long
  let sanitized = html.substring(0, maxLength);

  // Sanitize with DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,  // Keep text inside removed tags
  });

  return sanitized;
}

export function sanitizeText(text: string, maxLength = 500): string {
  // For plain text, just trim and truncate
  return text.trim().substring(0, maxLength);
}

export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    // If URL() throws, it's invalid
    return false;
  }
}

export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/*
import { sanitizeHTML, sanitizeText, isSafeURL } from '../utils/sanitize';

export function UserProfile({ user }) {
  const safeBio = sanitizeHTML(user.bio, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    maxLength: 1000,
  });

  return (
    <div>
      <h1>{sanitizeText(user.name)}</h1>
      <div dangerouslySetInnerHTML={{ __html: safeBio }} />
      <a href={isSafeURL(user.website) ? user.website : '#'}>Website</a>
    </div>
  );
}

interface FormData {
  description: string;
  amount: number;
  category: string;
}

export function ExpenseForm() {
  const [formData, setFormData] = React.useState<FormData>({
    description: '',
    amount: 0,
    category: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize before setting state
    let sanitized = sanitizeText(value, 200);

    // Additional validation per field
    if (name === 'description') {
      // Only alphanumeric + basic punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-.,]/g, '');
    }

    if (name === 'amount') {
      // Ensure numeric
      sanitized = value.replace(/[^0-9.]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  return (
    <form>
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="What did you spend on?"
        maxLength={200}
      />
    </form>
  );
}
*/
export default {
  sanitizeHTML,
  sanitizeText,
  isSafeURL,
  escapeHTML,
};
