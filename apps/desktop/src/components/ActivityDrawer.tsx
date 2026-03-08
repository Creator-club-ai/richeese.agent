import { ActivityFeed } from './ActivityFeed';

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  createdAt: string;
};

type ActivityDrawerProps = {
  open: boolean;
  items: ActivityItem[];
  onClose: () => void;
};

export const ActivityDrawer = ({ open, items, onClose }: ActivityDrawerProps) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.5)',
          transition: 'opacity 200ms ease',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Drawer panel */}
      <aside
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-default)',
          padding: 20,
          transition: 'transform 200ms ease, opacity 200ms ease',
          transform: open ? 'translateX(0)' : 'translateX(24px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="notion-label">실행 기록</div>
            <h2 style={{ marginTop: 6, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              최근 로그
            </h2>
          </div>
          <button
            className="notion-btn notion-btn-ghost"
            onClick={onClose}
            style={{ width: 28, height: 28, padding: 0, fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ marginTop: 16, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <ActivityFeed items={items} />
        </div>
      </aside>
    </>
  );
};
