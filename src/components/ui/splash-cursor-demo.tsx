
import { SplashCursor } from "@/components/ui/splash-cursor";

export function SplashCursorDemo() {
  return (
    <SplashCursor 
      BACK_COLOR={{ r: 0, g: 0, b: 0 }}
      TRANSPARENT={true}
      DENSITY_DISSIPATION={3.5}
      VELOCITY_DISSIPATION={2}
      PRESSURE={0.1}
      PRESSURE_ITERATIONS={20}
      CURL={3}
      SPLAT_RADIUS={0.2}
      SPLAT_FORCE={6000}
    />
  );
}
