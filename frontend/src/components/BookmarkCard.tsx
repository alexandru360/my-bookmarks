import { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
}

function domain(url: string) {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function BookmarkCard({ bookmark, onEdit, onDelete }: Props) {
  return (
    <div className="bookmark-card">
      <div className="bm-header">
        {bookmark.favicon
          ? <img src={bookmark.favicon} alt="" className="bm-favicon" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div className="bm-favicon-placeholder">🔗</div>}
        <div className="bm-meta">
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="bm-title">
            {bookmark.title}
          </a>
          <span className="bm-domain">{domain(bookmark.url)}</span>
        </div>
        <div className="bm-actions">
          <button onClick={onEdit} className="icon-btn" title="Edit">✏️</button>
          <button onClick={onDelete} className="icon-btn" title="Delete">🗑</button>
        </div>
      </div>
      {bookmark.description && <p className="bm-desc">{bookmark.description}</p>}
      <div className="bm-footer">
        {bookmark.category && (
          <span className="bm-cat-badge" style={{ background: bookmark.category.color + '30', color: bookmark.category.color }}>
            {bookmark.category.icon} {bookmark.category.name}
          </span>
        )}
        {bookmark.tags && bookmark.tags.split(',').map(t => (
          <span key={t} className="bm-tag">{t.trim()}</span>
        ))}
        <span className="bm-date">{new Date(bookmark.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
