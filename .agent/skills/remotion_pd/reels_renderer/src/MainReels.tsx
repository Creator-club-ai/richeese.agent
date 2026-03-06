import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';

export const MainReels = ({ title, subtitles }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 현재 시간에 맞는 자막 찾기
    const currentTime = frame / fps;
    const currentSubtitle = subtitles.find(
        (sub) => currentTime >= sub.start && currentTime <= sub.end
    );

    // 컨테이너 등장 애니메이션 (Spring)
    const scale = spring({
        frame,
        fps,
        config: { damping: 12 },
    });

    // 부드러운 줌인 효과 브이로그 스타일 배경 (단색 대체)
    const backgroundZoom = interpolate(frame, [0, 300], [1, 1.1]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>

            {/* 단순화된 배경 (추후 비디오 태그 교체 가능) */}
            <AbsoluteFill style={{
                backgroundColor: '#111',
                transform: `scale(${backgroundZoom})`,
                transition: 'transform 0.1s linear'
            }} />

            {/* 브랜드 데코레이션 요소 */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '20px',
                backgroundColor: '#ff5100'
            }} />

            {/* 메인 타이포그래피 영역 */}
            <div style={{
                transform: `scale(${scale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#ff5100', fontSize: '80px', fontWeight: 'bold', fontFamily: 'sans-serif', marginBottom: '40px' }}>
                    {title}
                </h1>

                {/* 현재 자막 텍스트 렌더링 */}
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '20px 40px',
                    borderRadius: '20px',
                    minHeight: '200px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <p style={{
                        color: '#fff',
                        fontSize: '64px',
                        fontFamily: 'sans-serif',
                        fontWeight: '600',
                        lineHeight: 1.4,
                        wordBreak: 'keep-all'
                    }}>
                        {currentSubtitle ? currentSubtitle.text : ''}
                    </p>
                </div>
            </div>

        </AbsoluteFill>
    );
};
