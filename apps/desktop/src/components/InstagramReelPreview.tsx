import type { InstagramPhoneReelPreviewModel } from '../lib/viewModels';
import { PhoneFrame } from './PhoneFrame';

type InstagramReelPreviewProps = {
  model: InstagramPhoneReelPreviewModel;
};

export const InstagramReelPreview = ({ model }: InstagramReelPreviewProps) => {
  return (
    <PhoneFrame>
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {model.videoUrl ? (
          <video controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} src={model.videoUrl} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-secondary)' }} />
        )}

        {/* Bottom gradient overlay */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: '45%', background: 'rgba(0,0,0,0.6)' }} />

        {/* Phase badge */}
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 14,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-soft)',
            fontSize: 9,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent)',
          }}
        >
          {model.phaseLabel}
        </div>

        {/* Side action buttons */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {['L', 'C', 'S', '⋯'].map((item) => (
            <div
              key={item}
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Placeholder content */}
        {!model.videoUrl ? (
          <div style={{ position: 'absolute', left: 16, right: 52, top: 72 }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 9,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
              }}
            >
              {model.badgeLabel}
            </div>
            <h3
              style={{
                marginTop: 12,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              {model.title}
            </h3>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {model.lines.map((line) => (
                <div
                  key={line}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-tertiary)',
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Bottom user info + caption */}
        <div style={{ position: 'absolute', bottom: 16, left: 14, right: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-muted)',
              }}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{model.username}</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{model.statusLabel}</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{model.caption}</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};
