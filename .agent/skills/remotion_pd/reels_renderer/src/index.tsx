import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { MainReels } from './MainReels';

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="MainReels"
                component={MainReels}
                durationInFrames={300} // 기본 10초 (30fps 기준), 실제 렌더링 시 props로 덮어씌워짐
                fps={30}
                width={1080}
                height={1920} // 9:16 인스타그램 릴스 규격
                defaultProps={{
                    title: '기본 타이틀',
                    subtitles: [
                        { start: 0, end: 3, text: "YFC에 오신 것을 환영합니다." }
                    ]
                }}
            />
        </>
    );
};

registerRoot(RemotionRoot);
