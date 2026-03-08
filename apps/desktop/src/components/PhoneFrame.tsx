import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const PhoneFrame = ({ children, footer }: PhoneFrameProps) => {
  return (
    <div style={{ margin: '0 auto', width: '100%', maxWidth: 380 }}>
      <div
        style={{
          borderRadius: 32,
          border: '1px solid var(--border-default)',
          background: 'var(--bg-tertiary)',
          padding: 6,
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 26,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-primary)',
          }}
        >
          {/* Status bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 20px 4px',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <span>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', border: '1px solid var(--text-tertiary)' }} />
              <span style={{ display: 'block', width: 16, height: 7, borderRadius: 2, border: '1px solid var(--text-tertiary)' }} />
            </div>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', aspectRatio: '9 / 18.8', background: 'var(--bg-primary)' }}>
            {children}
          </div>

          {/* Home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 8px' }}>
            <div style={{ width: 80, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }} />
          </div>
        </div>
      </div>
      {footer ? <div style={{ marginTop: 12 }}>{footer}</div> : null}
    </div>
  );
};
