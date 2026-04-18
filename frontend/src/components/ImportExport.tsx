import { useRef, useState } from 'react';
import { exportBookmarks, importBookmarks } from '../api';

interface Props {
  onClose: () => void;
  onImported: () => void;
}

export default function ImportExport({ onClose, onImported }: Props) {
  const [tab, setTab] = useState<'import' | 'export'>('import');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setStatus('');
    try {
      const res = await importBookmarks(file);
      setStatus(`✅ Imported ${res.imported} bookmarks successfully!`);
      onImported();
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import / Export</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="tab-bar">
          <button className={tab === 'import' ? 'tab active' : 'tab'} onClick={() => setTab('import')}>Import</button>
          <button className={tab === 'export' ? 'tab active' : 'tab'} onClick={() => setTab('export')}>Export</button>
        </div>

        {tab === 'import' && (
          <div>
            <p className="hint">Accepts Chrome or Firefox exported HTML, or a JSON file.</p>
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {loading ? <div className="spinner" /> : <><span>📂</span><span>Drop file here or click to browse</span></>}
            </div>
            <input ref={fileRef} type="file" accept=".html,.json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {status && <p className="import-status">{status}</p>}
          </div>
        )}

        {tab === 'export' && (
          <div className="export-buttons">
            <p className="hint">Download all your bookmarks in a format compatible with your browser.</p>
            <button className="btn btn-primary" onClick={() => exportBookmarks('chrome')}>
              🌐 Export for Chrome
            </button>
            <button className="btn btn-primary" onClick={() => exportBookmarks('firefox')}>
              🦊 Export for Firefox
            </button>
            <button className="btn btn-secondary" onClick={() => exportBookmarks('json')}>
              📄 Export as JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
