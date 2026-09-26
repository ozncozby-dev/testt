import React from 'react';
import {Composition, Still} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config/timeline';
import {Film} from './Film';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LuxuryPrimeFilm" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="LuxuryPrimePoster" component={Film} width={WIDTH} height={HEIGHT} />
  </>
);
