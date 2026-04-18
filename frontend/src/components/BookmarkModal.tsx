import { useEffect, useState } from 'react';
import { Bookmark, BookmarkFormData, Category } from '../types';

interface Props {
  bookmark?: Bookmark | null;
  categories: Category[];
  onSave: (data: BookmarkFormData) => Promise<void>;
  onClose: () => void;
}

export default function BookmarkModal({ bookmark, categories, onSave, onClose }: Props) {
  const [form, setForm] = useState<BookmarkFormData>({
    url: '', title: '', description: '', tags: '', categoryId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookmark) {
      setForm({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description || '',
        tags: bookmark.tags || '',
        categoryId: bookmark.categoryId,
      });
    }
  }, [bookmark]);

  function set(field: keyof BookmarkFormData, value: string | number | undefined) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({ ...form, categoryId: form.categoryId || undefined });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving bookmark');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bookmark ? 'Edit Bookmark' : 'Add Bookmark'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>URL *</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." required />
          </div>
          <div className="field">
            <label>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Page title" required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Optional..." />
          </div>
          <div className="field">
            <label>Tags</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="tech, tools, news" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.categoryId || ''} onChange={e => set('categoryId', e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
