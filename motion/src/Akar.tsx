import React from 'react';
import { Composition } from 'remotion';
import { Video, Props, totalFrame, FPS } from './Video';
import { VideoAnimasi, PropsAnimasi, totalFrameAnimasi } from './VideoAnimasi';
import contoh from '../naskah/contoh.json';
import contohAnimasi from '../naskah/contoh_animasi.json';

export const Akar: React.FC = () => (
  <>
    <Composition
      id="Motion"
      component={Video}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={totalFrame(contoh as unknown as Props)}
      defaultProps={contoh as unknown as Props}
      calculateMetadata={({ props }) => ({ durationInFrames: totalFrame(props) })}
    />
    <Composition
      id="AnimasiBergerak"
      component={VideoAnimasi}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={totalFrameAnimasi(contohAnimasi as unknown as PropsAnimasi)}
      defaultProps={contohAnimasi as unknown as PropsAnimasi}
      calculateMetadata={({ props }) => ({
        durationInFrames: totalFrameAnimasi(props as PropsAnimasi),
        width: (props as PropsAnimasi)?.rasio === 'landscape' ? 1920 : 1080,
        height: (props as PropsAnimasi)?.rasio === 'landscape' ? 1080 : 1920,
      })}
    />
  </>
);
