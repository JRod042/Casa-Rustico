import { Component, type ErrorInfo, type ReactNode } from "react";
import { Platform } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { CafeStageSkia } from "./CafeStageSkia";
import { CafeStageViews } from "./CafeStageViews";
import { SKIA_FPS_KILL, SKIA_PRIMARY } from "./skiaStack";

type StageProps = {
  width: number;
  height: number;
  groundY: number;
  scroll: SharedValue<number>;
};

class StageBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn("CafeStage Skia fallback", error.message, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * PRIMARY: Skia canvas parallax. Fallback: Reanimated Views
 * if web, fps kill, or Skia throws on device.
 */
export function CafeStage(props: StageProps) {
  const fallback = <CafeStageViews {...props} />;
  const useSkia =
    SKIA_PRIMARY && !SKIA_FPS_KILL && Platform.OS !== "web";
  if (!useSkia) return fallback;
  return <StageBoundary fallback={fallback}><CafeStageSkia {...props} /></StageBoundary>;
}
