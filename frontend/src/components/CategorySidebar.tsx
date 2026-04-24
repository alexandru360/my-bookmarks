import { useState } from 'react';
import { Category } from '../types';
import { createCategory, deleteCategory } from '../api';

interface Props {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  onRefresh: () => void;
  counts: Record<number, number>;
  totalCount: number;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onImportExport: () => void;
}

const PALETTE = ['#7c3aed','#db2777','#dc2626','#d97706','#16a34a','#0891b2','#4f46e5','#9333ea'];

export default function CategorySidebar({ categories, selected, onSelect, onRefresh, counts, totalCount, isOpen, onClose, onLogout, onImportExport }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [icon, setIcon] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createCategory({ name: name.trim(), color, icon: icon.trim() || undefined });
    setName(''); setIcon(''); setAdding(false);
    onRefresh();
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete category? Bookmarks will be uncategorized.')) return;
    await deleteCategory(id);
    if (selected === id) onSelect(null);
    onRefresh();
  }

  function handleSelect(id: number | null) {
    onSelect(id);
    onClose();
  }

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Categories</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
      </div>
      <ul className="category-list">
        <li className={`category-item ${selected === null ? 'active' : ''}`} onClick={() => handleSelect(null)}>
          <span>🗂</span> All Bookmarks
          <span className="cat-count">{totalCount}</span>
        </li>
        {categories.map(cat => (
          <li
            key={cat.id}
            className={`category-item ${selected === cat.id ? 'active' : ''}`}
            onClick={() => handleSelect(cat.id)}
          >
            <span style={{ color: cat.color }}>{cat.icon || '📁'}</span>
            <span className="cat-name">{cat.name}</span>
            <span className="cat-count">{counts[cat.id] || 0}</span>
            <button className="cat-del" onClick={(e) => handleDelete(cat.id, e)} title="Delete">×</button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form className="cat-form" onSubmit={handleAdd}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" autoFocus required />
          <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Icon emoji (optional)" maxLength={4} />
          <div className="color-picker">
            {PALETTE.map(c => (
              <button key={c} type="button" className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <div className="cat-form-actions">
            <button type="submit" className="btn btn-primary">Add</button>
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="btn-add-cat" onClick={() => setAdding(true)}>+ New Category</button>
      )}

      <div className="sidebar-mobile-footer">
        <button className="btn btn-secondary" onClick={() => { onImportExport(); onClose(); }}>📤 Import / Export</button>
        <button className="btn btn-ghost" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}
