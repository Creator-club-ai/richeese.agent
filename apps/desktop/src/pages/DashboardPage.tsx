import { useEffect, useState } from 'react';
import { ActivityDrawer } from '../components/ActivityDrawer';
import { Sidebar, type ShellView } from '../components/Sidebar';
import { PostsPage } from './PostsPage';
import { ReelsPage } from './ReelsPage';
import { useAppStore } from '../store/useAppStore';

export const DashboardPage = () => {
  const {
    workspace,
    activity,
    isBooting,
    isBusy,
    error,
    bootstrap,
    refreshAll,
    openPath,
    clearError,
  } = useAppStore();

  const [view, setView] = useState<ShellView>('posts');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <Sidebar currentView={view} onChangeView={setView} />

        {/* Main area */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              height: 44,
              borderBottom: '1px solid var(--border-default)',
              flexShrink: 0,
            }}
          >
            {/* Left: drag region for window title bar */}
            <div className="drag-region" style={{ flex: 1, height: '100%' }} />

            {/* Right: action buttons */}
            <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="notion-btn notion-btn-ghost"
                onClick={() => setDrawerOpen(true)}
              >
                기록
              </button>
              <button
                className="notion-btn notion-btn-ghost"
                onClick={() => void refreshAll()}
                disabled={isBusy}
              >
                새로고침
              </button>
              <button
                className="notion-btn notion-btn-secondary"
                onClick={() =>
                  void openPath(
                    view === 'posts'
                      ? workspace?.projectRoot ?? 'projects'
                      : workspace?.reelsRoot ?? '.agent/skills/remotion_pd/reels_renderer/jobs',
                  )
                }
              >
                {view === 'posts' ? '📁 게시물 폴더' : '📁 릴스 폴더'}
              </button>
            </div>
          </header>

          {/* Content area */}
          <div style={{ flex: 1, overflow: 'hidden', padding: 20 }}>
            {/* Error banner */}
            {error ? (
              <div
                className="animate-fade-in"
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-soft)',
                  borderLeft: '3px solid var(--danger)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>{error}</div>
                <button className="notion-btn notion-btn-ghost" onClick={clearError}>
                  닫기
                </button>
              </div>
            ) : null}

            <div style={{ height: '100%', overflowY: 'auto' }}>
              {view === 'posts' ? <PostsPage /> : <ReelsPage />}
            </div>
          </div>

          {/* Loading indicators */}
          {isBooting ? (
            <div
              style={{
                position: 'fixed',
                right: 20,
                top: 52,
                zIndex: 30,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              불러오는 중…
            </div>
          ) : null}

          {isBusy ? (
            <div
              style={{
                position: 'fixed',
                right: 20,
                bottom: 20,
                zIndex: 30,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              실행 중…
            </div>
          ) : null}
        </main>
      </div>

      <ActivityDrawer open={drawerOpen} items={activity} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
