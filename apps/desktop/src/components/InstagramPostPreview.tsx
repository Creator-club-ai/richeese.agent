import { useState } from 'react';
import type { InstagramPhonePostPreviewModel } from '../lib/viewModels';
import { PhoneFrame } from './PhoneFrame';

type InstagramPostPreviewProps = {
  model: InstagramPhonePostPreviewModel;
};

export const InstagramPostPreview = ({ model }: InstagramPostPreviewProps) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = model.slides[Math.min(slideIndex, model.slides.length - 1)] ?? model.slides[0];

  return (
    <PhoneFrame
      footer={
        model.slides.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {model.slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSlideIndex(index)}
                style={{
                  height: 6,
                  width: index === slideIndex ? 20 : 6,
                  borderRadius: 999,
                  background: index === slideIndex ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              />
            ))}
          </div>
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
        {/* Instagram header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-default)',
            padding: '10px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-muted)',
              }}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{model.username}</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{model.phaseLabel}</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>···</div>
        </div>

        {/* Slide content */}
        <div style={{ padding: 12 }}>
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-secondary)',
            }}
          >
            {slide?.imageUrl ? (
              <img src={slide.imageUrl} alt={slide.title} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4/5',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-soft)',
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {slide?.accent}
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--accent)',
                        opacity: 0.7,
                      }}
                    >
                      {model.phaseLabel}
                    </div>
                    <h3
                      style={{
                        marginTop: 12,
                        fontSize: 20,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {slide?.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {slide?.body.map((line) => (
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
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '6px 14px',
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
          }}
        >
          <span>like</span>
          <span>chat</span>
          <span>send</span>
          <span style={{ marginLeft: 'auto' }}>save</span>
        </div>

        {/* Caption */}
        <div style={{ padding: '4px 14px 16px' }}>
          <div
            style={{
              fontSize: 11,
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: 6 }}>
              {model.username}
            </span>
            {model.caption}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
            }}
          >
            {`슬라이드 ${slideIndex + 1}/${model.slides.length}`}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};
