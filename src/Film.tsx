import React from 'react';
import {AbsoluteFill, Audio, interpolate} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {palette} from './config/brand';
import {soundtrackAsset} from './config/assets';
import {SCENES, TOTAL_FRAMES, TRANSITIONS, sceneTiming} from './config/timeline';
import {transitionFor} from './components/CameraTransition';
import {SCENE_COMPONENTS} from './scenes/Scenes';

export const Film: React.FC = () => {
  const audio = soundtrackAsset();
  return (
    <AbsoluteFill style={{background: palette.black}}>
      <TransitionSeries>
        {SCENES.flatMap((scene, i) => {
          const Scene = SCENE_COMPONENTS[scene.id];
          const nodes = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={sceneTiming(scene.id).duration} name={scene.label}>
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          const tr = TRANSITIONS[i];
          if (tr && i < SCENES.length - 1) {
            const {timing, presentation} = transitionFor(tr);
            nodes.push(<TransitionSeries.Transition key={`${scene.id}-t`} timing={timing} presentation={presentation} />);
          }
          return nodes;
        })}
      </TransitionSeries>
      {audio ? (
        <Audio
          src={audio}
          volume={(f) => interpolate(f, [0, 6, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      ) : null}
    </AbsoluteFill>
  );
};
