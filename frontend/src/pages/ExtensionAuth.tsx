import { useEffect, useState } from 'react';

export default function ExtensionAuth() {
  const [status, setStatus] = useState<'pending' | 'done' | 'error'>('pending');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }

    // Store token for the frontend too
    localStorage.setItem('token', token);

    // Try to notify the extension via postMessage
    window.postMessage({ type: 'MY_BOOKMARKS_TOKEN', token }, '*');

    setStatus('done');
    // Auto-close after 3s if opened as a tab by the extension
    setTimeout(() => window.close(), 3000);
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        {status === 'pending' && <><div className="spinner" /><p>Connecting...</p></>}
        {status === 'done' && (
          <>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2>Extension Connected!</h2>
            <p>You're logged in. This tab will close automatically.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48 }}>❌</div>
            <h2>Something went wrong</h2>
            <p>No token received. Try again from the extension.</p>
          </>
        )}
      </div>
    </div>
  );
}
