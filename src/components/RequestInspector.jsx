import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Activity,
  Search,
  Music,
  FileText,
  ExternalLink,
  Play,
  RefreshCw,
} from 'lucide-react';
import { subscribeToRequests, requestHistory, searchMusic, fetchSongDetails, fetchSongLyrics } from '../services/api';

export function RequestInspector({ isOpen, onClose, currentTrack }) {
  const [requests, setRequests] = useState(requestHistory);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'song' | 'lyrics'
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    return subscribeToRequests((newHistory) => {
      setRequests({ ...newHistory });
    });
  }, []);

  if (!isOpen) return null;

  const currentReq = requests[activeTab];

  const handleCopy = () => {
    if (!currentReq?.response) return;
    navigator.clipboard.writeText(JSON.stringify(currentReq.response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      if (activeTab === 'search') {
        await searchMusic('Love Me Not');
      } else if (activeTab === 'song') {
        const id = currentTrack?.id || 'UWD1fvFV';
        await fetchSongDetails(id);
      } else if (activeTab === 'lyrics') {
        await fetchSongLyrics({
          trackName: currentTrack?.title || 'Love Me Not',
          artistName: currentTrack?.artist || 'Ravyn Lenae',
          albumName: currentTrack?.album || 'Love Me Not / Love Is Blind',
          duration: currentTrack?.duration || 214,
        });
      }
    } catch (e) {
      console.error('Manual test error:', e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="inspector-backdrop" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title">
            <Activity size={20} color="#6366f1" />
            <span>API & Request Inspector</span>
          </div>
          <button
            id="close-inspector-btn"
            type="button"
            className="icon-btn-subtle"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Request Tabs */}
        <div className="inspector-nav">
          <button
            id="inspector-tab-search"
            type="button"
            className={`inspector-nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={15} />
            <span>1. Search Request</span>
          </button>

          <button
            id="inspector-tab-song"
            type="button"
            className={`inspector-nav-item ${activeTab === 'song' ? 'active' : ''}`}
            onClick={() => setActiveTab('song')}
          >
            <Music size={15} />
            <span>2. Song Audio (.mp4)</span>
          </button>

          <button
            id="inspector-tab-lyrics"
            type="button"
            className={`inspector-nav-item ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            <FileText size={15} />
            <span>3. About Song / Lyrics</span>
          </button>
        </div>

        {/* Inspector Body */}
        <div className="inspector-body">
          {/* Metadata & Status Bar */}
          <div className="meta-pill-group">
            <div className="meta-pill">
              <span>Status:</span>
              <span
                className={`status-tag ${
                  currentReq?.status === 200 ? 'ok' : currentReq?.status ? 'error' : ''
                }`}
              >
                {currentReq?.status ? `${currentReq.status} ${currentReq.status === 200 ? 'OK' : ''}` : 'Pending'}
              </span>
            </div>

            {currentReq?.latencyMs != null && (
              <div className="meta-pill">
                <span>Latency:</span>
                <strong style={{ color: '#38bdf8' }}>{currentReq.latencyMs} ms</strong>
              </div>
            )}

            {currentReq?.timestamp && (
              <div className="meta-pill">
                <span>Time:</span>
                <span>{currentReq.timestamp}</span>
              </div>
            )}

            <button
              id="retest-request-btn"
              type="button"
              className="action-btn"
              style={{ padding: '4px 12px', fontSize: '0.78rem' }}
              onClick={handleRunTest}
              disabled={isTesting}
            >
              <RefreshCw size={12} className={isTesting ? 'spinner' : ''} />
              <span>{isTesting ? 'Sending...' : 'Send Test Request'}</span>
            </button>
          </div>

          {/* Request Endpoint Description */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Target Endpoint & Purpose:
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#f8fafc', wordBreak: 'break-all' }}>
              {activeTab === 'search' && (
                <>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>GET </span>
                  {currentReq?.url || '/api/search?query=love%20me%20not'}
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>
                    Returns top query hit, songs list, albums, artists, and playlists.
                  </div>
                </>
              )}
              {activeTab === 'song' && (
                <>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>GET </span>
                  {currentReq?.url || `/api/songs/${currentTrack?.id || 'UWD1fvFV'}`}
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>
                    Returns downloadable and streamable <strong>.mp4 / .m4a</strong> audio URLs up to 320kbps bitrate.
                  </div>
                </>
              )}
              {activeTab === 'lyrics' && (
                <>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>GET </span>
                  {currentReq?.url || 'https://lrclib.net/api/get?track_name=Love+Me+Not&artist_name=Ravyn+Lenae'}
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>
                    Returns song metadata, duration, instrumental flag, plain lyrics, and synchronized karaoke lyrics with timestamps.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* If audio tab, display stream preview details */}
          {activeTab === 'song' && currentReq?.audioUrls?.length > 0 && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: 14, borderRadius: 10 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: 8 }}>
                Playable Audio Streams (.mp4 / AAC):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentReq.audioUrls.map((stream) => (
                  <div key={stream.quality} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                      Quality: {stream.quality}
                    </span>
                    <a
                      href={stream.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#a5b4fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>Direct .mp4 Stream</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON Response Code Viewer */}
          <div className="code-viewer-container">
            <div className="code-viewer-header">
              <span>Response Payload (JSON)</span>
              <button
                id="copy-json-payload-btn"
                type="button"
                className="icon-btn-subtle"
                onClick={handleCopy}
                disabled={!currentReq?.response}
                title="Copy JSON response"
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span style={{ marginLeft: 4, fontSize: '0.74rem' }}>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="code-block">
              {currentReq?.response
                ? JSON.stringify(currentReq.response, null, 2)
                : currentReq?.error
                ? `Error: ${currentReq.error}`
                : '// No request triggered yet. Click "Send Test Request" above or interact with the player.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
