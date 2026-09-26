import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {copy, finishes, palette} from '../config/brand';
import {FLATLAY_9, FLATLAY_CENTER, HERO_7, SIDE_TILT} from '../config/layouts';
import {ASSEMBLY_7, COLOR_STEPS, COLOR_SWEEP_FRAMES, FLATLAY_ENTRIES, LOGO_AT} from '../config/choreography';
import {sceneTiming, type SceneId} from '../config/timeline';
import {ease, mix, progress} from '../lib/motion';
import {BrandEndCard} from '../components/BrandEndCard';
import {ColorTransformation} from '../components/ColorTransformation';
import {KineticTypography} from '../components/KineticTypography';
import {LifestyleScene} from '../components/LifestyleScene';
import {MacroDetailScene} from '../components/MacroDetailScene';
import {ProductAssembly} from '../components/ProductAssembly';
import {ProductReveal} from '../components/ProductReveal';
import {StudioBackdrop} from '../components/StudioBackdrop';

/** Scene-local frame: 0 = nominal scene start (negative during the incoming transition). */
const useSceneFrame = (id: SceneId) => {
  const t = sceneTiming(id);
  return {f: useCurrentFrame() - t.preRoll, t};
};

// ------------------------------------------------------------------ 01
export const S01FirstLight: React.FC = () => {
  const {f, t} = useSceneFrame('firstLight');
  return (
    <AbsoluteFill>
      <ProductReveal frame={f} duration={t.duration} />
      <KineticTypography lines={[copy.s01]} frame={f} start={30} x={290} y={1760} size={54} weight={300} color="#E6DFD3" tracking={[0.62, 0.46]} opacity={0.92} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 02
export const S02CollectionForms: React.FC = () => {
  const {f, t} = useSceneFrame('collectionForms');
  const cam = progress(f, -12, t.duration, ease.soft);
  const camX = mix(-80, 80, cam);
  const scale = mix(1.07, 1.0, progress(f, -12, t.frames, ease.cinematic));
  return (
    <AbsoluteFill>
      <StudioBackdrop top="#F3EFE9" bottom="#D9D0C3" glow="rgba(255,253,249,0.9)" glowY={42} vignette={0.18} />
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '1920px 1300px'}}>
        <ProductAssembly slots={HERO_7} finish={finishes.onyx} frame={f} tilt={SIDE_TILT} uid="s02" entries={ASSEMBLY_7} camX={camX} />
      </AbsoluteFill>
      <KineticTypography lines={[copy.s02Title]} frame={f} start={112} x={1920} y={250} size={150} weight={200} color={palette.textDark} align="center" tracking={[0.9, 0.62]} />
      <KineticTypography lines={[copy.s02Sub]} frame={f} start={126} x={1920} y={470} size={44} weight={400} color="#8A7048" align="center" tracking={[0.62, 0.46]} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 03
export const S03ColorPersonality: React.FC = () => {
  const {f, t} = useSceneFrame('colorPersonality');
  const cam = progress(f, -12, t.duration, ease.soft);
  const scale = mix(1.06, 1.12, cam);
  const tx = mix(-30, 40, cam);
  const expand = progress(f, t.frames - 26, 36, ease.depart);
  return (
    <AbsoluteFill>
      <StudioBackdrop top="#E8E1D6" bottom="#CEC4B5" glow="rgba(255,250,242,0.75)" glowY={44} vignette={0.2} />
      <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${scale})`, transformOrigin: '1920px 1350px'}}>
        <ColorTransformation
          slots={HERO_7}
          frame={f}
          tilt={SIDE_TILT}
          uid="s03"
          steps={[...COLOR_STEPS]}
          sweepFrames={COLOR_SWEEP_FRAMES}
          fromX={420}
          toX={3500}
          expand={{x: 1920, y: 1400, amount: expand * 0.22}}
        />
      </AbsoluteFill>
      <KineticTypography lines={[copy.s03Title]} frame={f} start={22} end={t.frames - 24} x={1920} y={250} size={70} weight={300} color={palette.textDark} align="center" tracking={[0.5, 0.38]} />
      <KineticTypography lines={[copy.s03Sub]} frame={f} start={44} end={t.frames - 24} x={1920} y={400} size={40} weight={300} color={palette.textDark} align="center" tracking={[0.2, 0.12]} opacity={0.62} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 04
export const S04MorePossibilities: React.FC = () => {
  const {f, t} = useSceneFrame('morePossibilities');
  const cam = progress(f, -10, t.frames + 4, ease.cinematic);
  return (
    <AbsoluteFill>
      <StudioBackdrop top="#1E1E21" bottom="#121214" glow="rgba(255,246,230,0.10)" glowX={63} glowY={50} glowSize={50} vignette={0.5} />
      <AbsoluteFill style={{transform: `rotate(${mix(-4, 0, cam)}deg) scale(${mix(1.06, 1, cam)})`, transformOrigin: `${FLATLAY_CENTER.x}px ${FLATLAY_CENTER.y}px`}}>
        <ProductAssembly slots={FLATLAY_9} finish={finishes.ivory} frame={f} tilt={1} uid="s04" entries={FLATLAY_ENTRIES} dof={30} />
      </AbsoluteFill>
      <KineticTypography lines={copy.s04Lines} frame={f} start={12} end={92} x={300} y={960} size={72} weight={300} color={palette.textLight} tracking={[0.42, 0.3]} stagger={12} />
      <KineticTypography lines={[copy.s04Title]} frame={f} start={104} x={300} y={930} size={130} weight={200} color={palette.textLight} tracking={[0.8, 0.56]} />
      <KineticTypography lines={[copy.s04Sub]} frame={f} start={118} x={306} y={1120} size={42} weight={400} color={palette.goldLight} tracking={[0.56, 0.42]} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 05
export const S05MaterialDetails: React.FC = () => <MacroDetailScene finish={finishes.ivory} />;

// ------------------------------------------------------------------ 06
export const S06ProductToHome: React.FC = () => {
  const {f, t} = useSceneFrame('productToHome');
  return (
    <AbsoluteFill>
      <LifestyleScene frame={f} duration={t.frames} />
      <KineticTypography lines={[copy.s06a]} frame={f} start={10} end={66} x={300} y={330} size={66} weight={300} color="#2B2620" tracking={[0.48, 0.36]} />
      <KineticTypography lines={[copy.s06b]} frame={f} start={80} x={300} y={330} size={66} weight={400} color="#2B2620" tracking={[0.48, 0.36]} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 07
export const S07BrandSignature: React.FC = () => {
  const {f, t} = useSceneFrame('brandSignature');
  return <BrandEndCard frame={f} duration={t.frames} logoAt={LOGO_AT} />;
};

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  firstLight: S01FirstLight,
  collectionForms: S02CollectionForms,
  colorPersonality: S03ColorPersonality,
  morePossibilities: S04MorePossibilities,
  materialDetails: S05MaterialDetails,
  productToHome: S06ProductToHome,
  brandSignature: S07BrandSignature,
};
