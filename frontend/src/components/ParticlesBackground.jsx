import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { memo } from "react";

function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: "#0b1727",
        },
        particles: {
          number: { value: 80 },
          color: { value: "#3b82f6" },
          links: {
            enable: true,
            color: "#3b82f6",
            distance: 120,
            opacity: 0.3,
          },
          move: {
            enable: true,
            speed: 1,
          },
          size: {
            value: 2,
          },
        },
      }}
    />
  );
}

export default memo(ParticlesBackground);