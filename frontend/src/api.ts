import { Bookmark, BookmarkFormData, Category } from './types';

const BASE = '';

function getToken() {
  return localStorage.getItem('token') || '';
}

function headers(extra: Record<string, string> = {}) {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...extra };
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, { ...opts, headers: { ...headers(), ...(opts.headers as any) } });
  if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '/'; }
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const getMe = () => req<{ id: number; email: string; name: string; avatar: string }>('/auth/me');

// Bookmarks
export const getBookmarks = (search?: string, categoryId?: number) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoryId) params.set('categoryId', String(categoryId));
  return req<Bookmark[]>(`/bookmarks?${params}`);
};
export const createBookmark = (data: BookmarkFormData) =>
  req<Bookmark>('/bookmarks', { method: 'POST', body: JSON.stringify(data) });
export const updateBookmark = (id: number, data: Partial<BookmarkFormData>) =>
  req<Bookmark>(`/bookmarks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteBookmark = (id: number) =>
  req<void>(`/bookmarks/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => req<Category[]>('/categories');
export const createCategory = (data: { name: string; color: string; icon?: string }) =>
  req<Category>('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: number, data: Partial<Category>) =>
  req<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCategory = (id: number) =>
  req<void>(`/categories/${id}`, { method: 'DELETE' });

// Import/Export
export const importBookmarks = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/import-export/import', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const exportBookmarks = (format: 'chrome' | 'firefox' | 'json') => {
  const a = document.createElement('a');
  a.href = `/import-export/export?format=${format}&_token=${getToken()}`;
  a.download = format === 'json' ? 'bookmarks.json' : 'bookmarks.html';
  // Use fetch to include auth header then download
  fetch(`/import-export/export?format=${format}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    .then(r => r.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    });
};
