import { useCallback, useEffect, useMemo, useState } from 'react';
import { User, Bookmark, Category, BookmarkFormData } from '../types';
import { getBookmarks, createBookmark, updateBookmark, deleteBookmark, getCategories } from '../api';
import BookmarkCard from '../components/BookmarkCard';
import BookmarkModal from '../components/BookmarkModal';
import CategorySidebar from '../components/CategorySidebar';
import ImportExport from '../components/ImportExport';

interface Props { user: User; onLogout: () => void; }

export default function Dashboard({ user, onLogout }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);

  const loadBookmarks = useCallback(async () => {
    setBookmarks(await getBookmarks(search || undefined, selectedCat || undefined));
  }, [search, selectedCat]);

  const loadCategories = useCallback(async () => {
    setCategories(await getCategories());
  }, []);

  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const catCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    bookmarks.forEach(b => { if (b.categoryId) counts[b.categoryId] = (counts[b.categoryId] || 0) + 1; });
    return counts;
  }, [bookmarks]);

  async function handleSave(data: BookmarkFormData) {
    if (editingBookmark?.id) await updateBookmark(editingBookmark.id, data);
    else await createBookmark(data);
    loadBookmarks();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this bookmark?')) return;
    await deleteBookmark(id);
    loadBookmarks();
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-text">🔖 My Bookmarks</span>
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookmarks…"
          />
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>Import / Export</button>
          <button className="btn btn-primary" onClick={() => setEditingBookmark(null)}>+ Add</button>
          <div className="user-menu">
            {user.avatar ? <img src={user.avatar} alt="" className="avatar" /> : <span className="avatar-placeholder">{user.name[0]}</span>}
            <span className="user-name">{user.name}</span>
            <button className="btn btn-ghost" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <CategorySidebar
          categories={categories}
          selected={selectedCat}
          onSelect={setSelectedCat}
          onRefresh={loadCategories}
          counts={catCounts}
          totalCount={bookmarks.length}
        />

        <main className="main-content">
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🔖</div>
              <h2>No bookmarks yet</h2>
              <p>Save your first bookmark or import from Chrome/Firefox.</p>
              <button className="btn btn-primary" onClick={() => setEditingBookmark(null)}>Add Bookmark</button>
            </div>
          ) : (
            <div className="bookmark-grid">
              {bookmarks.map(b => (
                <BookmarkCard
                  key={b.id}
                  bookmark={b}
                  onEdit={() => setEditingBookmark(b)}
                  onDelete={() => handleDelete(b.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {editingBookmark !== undefined && (
        <BookmarkModal
          bookmark={editingBookmark}
          categories={categories}
          onSave={handleSave}
          onClose={() => setEditingBookmark(undefined)}
        />
      )}

      {showImport && (
        <ImportExport
          onClose={() => setShowImport(false)}
          onImported={() => { loadBookmarks(); setShowImport(false); }}
        />
      )}
    </div>
  );
}
