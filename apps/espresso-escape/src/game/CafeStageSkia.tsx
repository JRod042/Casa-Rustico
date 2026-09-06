import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Atlas,
  Canvas,
  Circle,
  Fill,
  Group,
  Image,
  LinearGradient,
  RoundedRect,
  Skia,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { FAKE_AO, FAKE_AO_BLEND, LEAF_DOT_PULSE_PX, STEAM_FIRST_MS } from "./juice";

/**
 * First Skia canvas path — kraft 2.5D parallax + 1-frame Atlas hook.
 * V2_HOLD: still the in-repo cafe-bg / runner stand-in, not Creative binaries.
 */
export function CafeStageSkia({
  width,
  height,
  groundY,
  scroll,
}: {
  width: number;
  height: number;
  groundY: number;
  scroll: SharedValue<number>;
}) {
  const floorH = Math.max(80, height - groundY);
  const reduce = useReducedMotion();
  const life = useSharedValue(0);
  const ambientGate = useSharedValue(0);
  const leafPulse = useSharedValue(0);
  const plate = useImage(require("../../assets/kraft/cafe-bg.png"));
  const runner = useImage(require("../../assets/kraft/runner.png"));

  useEffect(() => {
    ambientGate.value = reduce ? 1 : withDelay(STEAM_FIRST_MS, withTiming(1, { duration: 360 }));
    if (reduce) {
      life.value = 0.5;
      leafPulse.value = 0.5;
      return;
    }
    life.value = withRepeat(
      withTiming(1, { duration: 7200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    leafPulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [ambientGate, leafPulse, life, reduce]);

  const canopyT = useDerivedValue(() => [
    { translateX: -((scroll.value * 0.02) % width) },
  ]);
  const farT = useDerivedValue(() => [
    { translateX: -((scroll.value * 0.035) % width) },
  ]);
  const highlandT = useDerivedValue(() => [
    { translateX: -((scroll.value * 0.08) % width) },
  ]);
  const midT = useDerivedValue(() => [
    { translateX: -((scroll.value * 0.16) % width) },
  ]);
  const shelfT = useDerivedValue(() => [
    { translateX: -((scroll.value * 0.3) % width) },
  ]);
  const mistT = useDerivedValue(() => [
    { translateX: -(((scroll.value * 0.22) % 180) + 24) },
  ]);
  const groundT = useDerivedValue(() => [
    { translateX: -((scroll.value % 56) + 56) },
  ]);
  const nearT = useDerivedValue(() => [
    { translateX: -(((scroll.value * 1.12) % 56) + 56) },
  ]);
  const lightOp = useDerivedValue(() => 0.08 + life.value * 0.12);
  const shaftOp = useDerivedValue(() => 0.05 + life.value * 0.07);
  const windowOp = useDerivedValue(() => 0.07 + life.value * 0.08);
  const steamA = useDerivedValue(() => 0.14 + life.value * 0.18);
  const steamB = useDerivedValue(() => 0.1 + (1 - life.value) * 0.16);
  const atlasT = useDerivedValue(() => [
    { translateX: width * 0.72 - ((scroll.value * 0.26) % 22) },
    { translateY: groundY * 0.36 - 2 * life.value },
  ]);
  const plantSway = useDerivedValue(() => [
    { translateX: width * 0.08 - ((scroll.value * 0.18) % 36) },
    { translateY: groundY * 0.3 - 3 * life.value },
    { rotate: -2.2 + life.value * 3.2 },
  ]);
  const leafDotA = useDerivedValue(() => [
    { translateY: -LEAF_DOT_PULSE_PX + leafPulse.value * LEAF_DOT_PULSE_PX * 2 },
    { translateX: -1 + leafPulse.value * 2 },
  ]);
  const leafDotB = useDerivedValue(() => [
    { translateY: LEAF_DOT_PULSE_PX - leafPulse.value * LEAF_DOT_PULSE_PX * 2 },
    { translateX: 1 - leafPulse.value * 2 },
  ]);
  const clothSway = useDerivedValue(() => [
    { translateX: width * 0.7 - ((scroll.value * 0.26) % 22) },
    { translateY: groundY * 0.18 },
    { rotate: 1.2 - life.value * 2.4 },
  ]);
  const propFar = useDerivedValue(() => [
    { translateX: 14 - ((scroll.value * 0.3) % 40) },
    { translateY: groundY * 0.36 - 2 * life.value },
    { rotate: -1.4 + life.value * 0.8 },
  ]);
  const dustT = useDerivedValue(() => [
    { translateX: 12 * life.value },
    { translateY: -18 * life.value },
  ]);
  const dustOp = useDerivedValue(() => ambientGate.value * (0.16 + life.value * 0.22));
  const laterLife = useDerivedValue(() => ambientGate.value);
  const atlasSprites = [Skia.XYWHRect(0, 0, 48, 56)];
  const atlasForms = [Skia.RSXform(0.7, 0, 0, 0)];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="escape-diorama">
      <Canvas style={{ width, height }}>
        <Fill>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[t.wood, t.bg, t.espressoDeep]}
          />
        </Fill>

        <Group transform={canopyT} opacity={0.28}>
          {plate ? (
            <>
              <Image image={plate} x={0} y={0} width={width} height={groundY * 0.55} fit="cover" />
              <Image image={plate} x={width} y={0} width={width} height={groundY * 0.55} fit="cover" />
            </>
          ) : null}
        </Group>
        <Group transform={farT} opacity={0.42}>
          {plate ? (
            <>
              <Image image={plate} x={0} y={0} width={width} height={groundY} fit="cover" />
              <Image image={plate} x={width} y={0} width={width} height={groundY} fit="cover" />
            </>
          ) : null}
        </Group>
        <Group transform={highlandT} opacity={0.5}>
          {plate ? (
            <>
              <Image image={plate} x={0} y={groundY * 0.06} width={width} height={groundY * 0.78} fit="cover" />
              <Image image={plate} x={width} y={groundY * 0.06} width={width} height={groundY * 0.78} fit="cover" />
            </>
          ) : null}
        </Group>
        <Group transform={midT} opacity={0.62}>
          {plate ? (
            <>
              <Image image={plate} x={0} y={groundY * 0.14} width={width} height={groundY * 0.7} fit="cover" />
              <Image image={plate} x={width} y={groundY * 0.14} width={width} height={groundY * 0.7} fit="cover" />
            </>
          ) : null}
        </Group>

        <RoundedRect
          x={width * 0.18}
          y={8}
          width={54}
          height={groundY * 0.72}
          r={8}
          color={t.cream}
          opacity={shaftOp}
        />
        <RoundedRect
          x={width * 0.58}
          y={20}
          width={46}
          height={groundY * 0.62}
          r={8}
          color={t.cream}
          opacity={shaftOp}
        />
        <RoundedRect
          x={width * 0.62}
          y={groundY * 0.12}
          width={width * 0.22}
          height={64}
          r={10}
          color={t.cream}
          opacity={windowOp}
        />
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={groundY}
          r={0}
          color={t.cream}
          opacity={lightOp}
        />

        {FAKE_AO ? (
          <Group blendMode={FAKE_AO_BLEND}>
            <Circle cx={width * 0.64} cy={groundY * 0.24} r={40} color={t.espresso} opacity={0.28} />
            <Circle cx={width * 0.16} cy={groundY * 0.16} r={31} color={t.espresso} opacity={0.24} />
            <Circle cx={width * 0.42} cy={groundY * 0.3} r={23} color={t.espresso} opacity={0.24} />
          </Group>
        ) : null}
        <Circle cx={width * 0.64} cy={groundY * 0.24} r={36} color={t.cream} opacity={steamA} />
        <Circle cx={width * 0.16} cy={groundY * 0.16} r={28} color={t.cream} opacity={steamB} />
        <Circle cx={width * 0.42} cy={groundY * 0.3} r={20} color={t.cream} opacity={steamA} />

        <Group transform={mistT} opacity={0.15}>
          <RoundedRect x={-40} y={groundY * 0.1} width={width + 240} height={52} r={26} color={t.cream} />
        </Group>
        <Group transform={shelfT} opacity={0.28}>
          {plate ? (
            <>
              <Image image={plate} x={0} y={groundY * 0.48} width={width} height={groundY * 0.28} fit="cover" />
              <Image image={plate} x={width} y={groundY * 0.48} width={width} height={groundY * 0.28} fit="cover" />
            </>
          ) : null}
        </Group>

        <Group transform={dustT} opacity={dustOp}>
          <Circle cx={width * 0.1} cy={groundY * 0.14} r={1.6} color={t.cream} />
          <Circle cx={width * 0.38} cy={groundY * 0.1} r={1.4} color={t.cream} />
          <Circle cx={width * 0.66} cy={groundY * 0.16} r={1.6} color={t.cream} />
          <Circle cx={width * 0.88} cy={groundY * 0.22} r={1.3} color={t.cream} />
        </Group>

        <Group transform={plantSway} opacity={laterLife}>
          {FAKE_AO ? (
            <Group blendMode={FAKE_AO_BLEND}>
              <RoundedRect x={2} y={24} width={28} height={8} r={4} color={t.espresso} opacity={0.42} />
            </Group>
          ) : (
            <RoundedRect x={2} y={24} width={28} height={8} r={4} color={t.espresso} opacity={0.28} />
          )}
          <RoundedRect x={0} y={6} width={18} height={22} r={10} color={t.kraft} opacity={0.72} />
          <RoundedRect x={16} y={0} width={14} height={28} r={8} color={t.kraftDeep} opacity={0.7} />
          <Group transform={leafDotA}>
            <Circle cx={8} cy={8} r={2.2} color={t.kraftDeep} />
          </Group>
          <Group transform={leafDotB}>
            <Circle cx={22} cy={10} r={1.8} color={t.kraft} />
          </Group>
          <Circle cx={14} cy={4} r={1.6} color={t.kraftDeep} />
        </Group>
        <Group transform={clothSway} opacity={laterLife}>
          {FAKE_AO ? (
            <Group blendMode={FAKE_AO_BLEND}>
              <RoundedRect x={4} y={30} width={22} height={7} r={3} color={t.espresso} opacity={0.38} />
            </Group>
          ) : (
            <RoundedRect x={4} y={30} width={22} height={7} r={3} color={t.espresso} opacity={0.22} />
          )}
          <RoundedRect x={0} y={0} width={28} height={36} r={4} color={t.cream} />
        </Group>
        <Group transform={propFar} opacity={laterLife}>
          {FAKE_AO ? (
            <Group blendMode={FAKE_AO_BLEND}>
              <RoundedRect x={2} y={24} width={36} height={8} r={4} color={t.espresso} opacity={0.4} />
            </Group>
          ) : (
            <RoundedRect x={2} y={24} width={36} height={8} r={4} color={t.espresso} opacity={0.26} />
          )}
          <RoundedRect x={0} y={0} width={22} height={28} r={6} color={t.kraft} />
          <RoundedRect x={26} y={14} width={12} height={14} r={3} color={t.cream} />
        </Group>

        <Group transform={atlasT} opacity={laterLife}>
          <Atlas image={runner} sprites={atlasSprites} transforms={atlasForms} />
        </Group>

        <RoundedRect x={0} y={groundY - 14} width={width} height={14} r={0} color={t.kraftDeep} />
        <RoundedRect x={0} y={groundY - 4} width={width} height={5} r={0} color={t.kraft} />
        <RoundedRect x={0} y={groundY} width={width} height={floorH} r={0}>
          <LinearGradient
            start={vec(0, groundY)}
            end={vec(0, groundY + floorH)}
            colors={[t.cream, "#E4D2B8", t.kraftDeep]}
          />
        </RoundedRect>
        <Group transform={groundT}>
          {Array.from({ length: 10 }, (_, i) => (
            <RoundedRect
              key={`g${i}`}
              x={i * 96}
              y={groundY + 8}
              width={16}
              height={8}
              r={2}
              color={t.kraftDeep}
              opacity={0.36}
            />
          ))}
        </Group>
        <Group transform={nearT} opacity={0.45}>
          {Array.from({ length: 10 }, (_, i) => (
            <RoundedRect
              key={`n${i}`}
              x={i * 96}
              y={groundY + 22}
              width={12}
              height={6}
              r={2}
              color={t.kraftDeep}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}
