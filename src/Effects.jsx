import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Resolution } from "postprocessing";
export default function Effects() {
  return (
    <>
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          luminanceSmoothing={0.125}
          intensity={0.01}
          radius={1}
          luminanceThreshold={10.9}
          resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
          resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
        ></Bloom>
      </EffectComposer>
    </>
  );
}
