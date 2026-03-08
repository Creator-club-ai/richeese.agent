export type ShellView = 'posts' | 'reels';

type SidebarProps = {
  currentView: ShellView;
  onChangeView: (view: ShellView) => void;
};

const items: Array<{ id: ShellView; label: string; icon: string }> = [
  { id: 'posts', label: '게시물', icon: '⊞' },
  { id: 'reels', label: '릴스', icon: '▸' },
];

export const Sidebar = ({ currentView, onChangeView }: SidebarProps) => {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-default)',
        padding: '12px 8px',
        gap: 2,
      }}
    >
      {/* Drag area for Electron title bar */}
      <div className="drag-region" style={{ height: 32, flexShrink: 0 }} />

      {/* App branding */}
      <div
        style={{
          padding: '4px 8px 16px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '-0.01em',
        }}
      >
        콘텐츠 에이전트
      </div>

      {/* Navigation items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => {
          const active = item.id === currentView;

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 30,
                padding: '0 8px',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast), color var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 15, opacity: 0.7, width: 18, textAlign: 'center' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div style={{ flex: 1 }} />

      {/* Settings */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          height: 30,
          padding: '0 8px',
          fontSize: 13,
          color: 'var(--text-tertiary)',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>⚙</span>
        설정
      </button>
    </aside>
  );
};
