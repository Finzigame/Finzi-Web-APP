import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, Easing, View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const S = Dimensions.get('window').width / 393;

// Must be ≥ actual path length to guarantee full draw coverage
const PATH_LEN = 700;

const AnimatedPath   = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ChartProps {
    width: number;
    height: number;
    animKey: number;
    onComplete?: () => void;
}

const GrowthChart: React.FC<ChartProps> = ({ width, height, animKey, onComplete }) => {

    // ── Animated values ───────────────────────────────────────────────────────

    const drawProg     = useRef(new Animated.Value(0)).current; // 0 → PATH_LEN  (strokeDashoffset)
    const tProg        = useRef(new Animated.Value(0)).current; // 0 → 1          (position on curve)
    const glowOpacity  = useRef(new Animated.Value(0)).current;
    const glowPulse    = useRef(new Animated.Value(1)).current; // inner glow pulse multiplier

    // Projection bubbles (7 circles that stagger in after draw)
    const PROJ_COUNT = 7;
    const projOps = useRef(
        Array.from({ length: 7 }, () => new Animated.Value(0))
    ).current;

    // Milestone dot radii (SVG r prop, 0 → target)
    const dotR = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    // Endpoint
    const endR          = useRef(new Animated.Value(0)).current;
    const ring1R        = useRef(new Animated.Value(0)).current;
    const ring1Opacity  = useRef(new Animated.Value(0)).current;
    const ring2R        = useRef(new Animated.Value(0)).current;
    const ring2Opacity  = useRef(new Animated.Value(0)).current;
    const arrowOpacity  = useRef(new Animated.Value(0)).current;

    const milestoneTriggered = useRef([false, false, false]);
    const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

    // ── Geometry (memoized — only changes if card size changes) ───────────────

    const geo = useMemo(() => {
        const sx = 0,         sy = height * 0.88;
        const ex = width * 0.68, ey = height * 0.12;
        const cp1x = width * 0.32, cp1y = sy;
        const cp2x = width * 0.62, cp2y = ey;
        const dcp2x = width * 0.82;
        const maxDashX = width * 0.88;

        const bezierPt = (t: number) => {
            const mt = 1 - t;
            return {
                x: mt*mt*mt*sx + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*ex,
                y: mt*mt*mt*sy + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*ey,
            };
        };

        // 120-point lookup table for smooth traveling-dot interpolation
        const N = 120;
        const tSamples = Array.from({ length: N + 1 }, (_, i) => i / N);
        const points   = tSamples.map(t => bezierPt(t));

        // Pre-compute 7 projection bubble positions along the continuation curve
        const projBezier = (t: number) => {
            const mt = 1 - t;
            const p1x = dcp2x, p1y = ey;
            const p2x = maxDashX, p2y = ey * 0.7;
            const p3x = maxDashX, p3y = ey * 0.4;
            return {
                x: mt*mt*mt*ex + 3*mt*mt*t*p1x + 3*mt*t*t*p2x + t*t*t*p3x,
                y: mt*mt*mt*ey + 3*mt*mt*t*p1y + 3*mt*t*t*p2y + t*t*t*p3y,
            };
        };
        const projDots = Array.from({ length: 7 }, (_, i) => projBezier((i + 1) / 8));

        return {
            sx, sy, ex, ey,
            solidPath: `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`,
            tSamples,
            xRange: points.map(p => p.x),
            yRange: points.map(p => p.y),
            milestones: [0.3, 0.55, 0.78].map(t => bezierPt(t)),
            projDots,
            arrowS: 5 * S,
        };
    }, [width, height]);

    // Traveling dot position (derives from tProg 0→1)
    const dotX = tProg.interpolate({ inputRange: geo.tSamples, outputRange: geo.xRange });
    const dotY = tProg.interpolate({ inputRange: geo.tSamples, outputRange: geo.yRange });

    // strokeDashoffset: PATH_LEN → 0
    const dashOffset = drawProg.interpolate({
        inputRange:  [0, PATH_LEN],
        outputRange: [PATH_LEN, 0],
    });

    // ── Animation sequence ────────────────────────────────────────────────────

    useEffect(() => {
        // — Reset —
        drawProg.setValue(0);
        tProg.setValue(0);
        glowOpacity.setValue(0);
        glowPulse.setValue(1);
        projOps.forEach(op => op.setValue(0));
        dotR.forEach(r => r.setValue(0));
        endR.setValue(0);
        ring1R.setValue(0);  ring1Opacity.setValue(0);
        ring2R.setValue(0);  ring2Opacity.setValue(0);
        arrowOpacity.setValue(0);
        milestoneTriggered.current = [false, false, false];
        pulseLoopRef.current?.stop();

        // — Milestone listener —
        const listenerId = tProg.addListener(({ value }) => {
            const thresholds = [0.3, 0.55, 0.78];
            thresholds.forEach((thresh, i) => {
                if (value >= thresh && !milestoneTriggered.current[i]) {
                    milestoneTriggered.current[i] = true;
                    Animated.spring(dotR[i], {
                        toValue: 4.5 * S,
                        bounciness: 20,
                        speed: 28,
                        useNativeDriver: false,
                    }).start();
                }
            });
        });

        // — Phase 1: glow fades in, inner pulse starts —
        Animated.timing(glowOpacity, {
            toValue: 1, duration: 300, useNativeDriver: false,
        }).start();

        pulseLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 1.35, duration: 350, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
                Animated.timing(glowPulse, { toValue: 0.75, duration: 350, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            ])
        );
        pulseLoopRef.current.start();

        // — Phase 2: draw line (inOut ease — slow start, fast middle, soft end) —
        const DRAW_MS = 1700;
        Animated.parallel([
            Animated.timing(drawProg, {
                toValue: PATH_LEN,
                duration: DRAW_MS,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(tProg, {
                toValue: 1,
                duration: DRAW_MS,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start(() => {
            tProg.removeListener(listenerId);
            pulseLoopRef.current?.stop();

            // — Phase 3: glow out, end elements in —
            Animated.parallel([
                Animated.timing(glowOpacity,   { toValue: 0, duration: 300, useNativeDriver: false }),
                Animated.timing(arrowOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
                // Projection bubbles stagger in
                Animated.stagger(55, projOps.map(op =>
                    Animated.spring(op, { toValue: 1, bounciness: 14, speed: 22, useNativeDriver: false })
                )),
                Animated.spring(endR, {
                    toValue: 6 * S, bounciness: 22, speed: 14, useNativeDriver: false,
                }),
            ]).start(() => {

                // — Phase 4: sonar rings —
                ring1Opacity.setValue(0.9);
                ring2Opacity.setValue(0.75);
                Animated.stagger(180, [
                    Animated.parallel([
                        Animated.timing(ring1R,       { toValue: 26 * S, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: false }),
                        Animated.timing(ring1Opacity, { toValue: 0,      duration: 650, useNativeDriver: false }),
                    ]),
                    Animated.parallel([
                        Animated.timing(ring2R,       { toValue: 20 * S, duration: 550, easing: Easing.out(Easing.quad), useNativeDriver: false }),
                        Animated.timing(ring2Opacity, { toValue: 0,      duration: 550, useNativeDriver: false }),
                    ]),
                ]).start();

                // — Phase 5: reward → parent bounces meta value —
                onComplete?.();
            });
        });

        return () => {
            tProg.removeListener(listenerId);
            pulseLoopRef.current?.stop();
        };
    }, [animKey]);

    // ── Render ────────────────────────────────────────────────────────────────

    const { sx, sy, ex, ey, solidPath, milestones, projDots, arrowS } = geo;

    return (
        <View style={{ width, height, overflow: 'hidden' }}>
            <Svg width={width} height={height}>

                <Defs>
                    {/* Gradient for the main growth line */}
                    <LinearGradient id="lineGrad" x1={sx} y1={sy} x2={ex} y2={ey} gradientUnits="userSpaceOnUse">
                        <Stop offset="0"   stopColor="#005A52" stopOpacity="1" />
                        <Stop offset="0.5" stopColor="#00875C" stopOpacity="1" />
                        <Stop offset="1"   stopColor="#00D4A0" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* ── 1. Projection bubbles (stagger in after draw) ── */}
                {projDots.map((pos, i) => {
                    // Bigger and more opaque near the line, smaller/transparent farther away
                    const ratio = 1 - i / (PROJ_COUNT - 1);
                    const r = (4.5 - i * 0.45) * S;
                    const maxOpacity = 0.2 + ratio * 0.55;
                    return (
                        <AnimatedCircle
                            key={`proj-${i}`}
                            cx={pos.x}
                            cy={pos.y}
                            r={projOps[i].interpolate({
                                inputRange:  [0, 1],
                                outputRange: [0, r],
                            }) as any}
                            fill="#00875C"
                            fillOpacity={projOps[i].interpolate({
                                inputRange:  [0, 1],
                                outputRange: [0, maxOpacity],
                            }) as any}
                        />
                    );
                })}

                {/* ── 2. Soft glow shadow under main line ── */}
                <AnimatedPath
                    d={solidPath}
                    stroke="#00D4A0"
                    strokeWidth={14 * S}
                    strokeOpacity={0.12 as any}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${PATH_LEN}`}
                    strokeDashoffset={dashOffset as any}
                />

                {/* ── 3. Main gradient line (draws on) ── */}
                <AnimatedPath
                    d={solidPath}
                    stroke="url(#lineGrad)"
                    strokeWidth={5.5 * S}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${PATH_LEN}`}
                    strokeDashoffset={dashOffset as any}
                />

                {/* ── 4. Traveling glow head — outer halo ── */}
                <AnimatedCircle
                    cx={dotX as any}
                    cy={dotY as any}
                    r={glowPulse.interpolate({ inputRange: [0.75, 1.35], outputRange: [16 * S, 22 * S] }) as any}
                    fill="#00FFB9"
                    fillOpacity={glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }) as any}
                />

                {/* ── 5. Traveling glow head — mid halo ── */}
                <AnimatedCircle
                    cx={dotX as any}
                    cy={dotY as any}
                    r={glowPulse.interpolate({ inputRange: [0.75, 1.35], outputRange: [8 * S, 12 * S] }) as any}
                    fill="#00FFB9"
                    fillOpacity={glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.30] }) as any}
                />

                {/* ── 6. Traveling glow head — bright core ── */}
                <AnimatedCircle
                    cx={dotX as any}
                    cy={dotY as any}
                    r={glowPulse.interpolate({ inputRange: [0.75, 1.35], outputRange: [3.5 * S, 5 * S] }) as any}
                    fill="#FFFFFF"
                    fillOpacity={glowOpacity as any}
                />

                {/* ── 7. Milestone dots (pop in as line passes them) ── */}
                {milestones.map((pos, i) => (
                    <AnimatedCircle
                        key={i}
                        cx={pos.x}
                        cy={pos.y}
                        r={dotR[i] as any}
                        fill="#FFCA4D"
                        stroke="#FFF8E1"
                        strokeWidth={1.5 * S}
                    />
                ))}

                {/* ── 8. Sonar rings (expand from endpoint) ── */}
                <AnimatedCircle
                    cx={ex} cy={ey}
                    r={ring1R as any}
                    fill="none"
                    stroke="#00D4A0"
                    strokeWidth={2.5 * S}
                    strokeOpacity={ring1Opacity as any}
                />
                <AnimatedCircle
                    cx={ex} cy={ey}
                    r={ring2R as any}
                    fill="none"
                    stroke="#FFCA4D"
                    strokeWidth={2 * S}
                    strokeOpacity={ring2Opacity as any}
                />

                {/* ── 9. Endpoint dot (springs in) ── */}
                <AnimatedCircle
                    cx={ex} cy={ey}
                    r={endR as any}
                    fill="#00675D"
                    stroke="#FFFFFF"
                    strokeWidth={2 * S}
                />

                {/* ── 10. Arrow head (fades in after draw) ── */}
                <AnimatedPath
                    d={`M ${ex - arrowS} ${ey - arrowS} L ${ex} ${ey}`}
                    stroke="#005A52"
                    strokeWidth={4 * S}
                    strokeLinecap="round"
                    strokeOpacity={arrowOpacity as any}
                />
                <AnimatedPath
                    d={`M ${ex - arrowS} ${ey + arrowS} L ${ex} ${ey}`}
                    stroke="#005A52"
                    strokeWidth={4 * S}
                    strokeLinecap="round"
                    strokeOpacity={arrowOpacity as any}
                />

            </Svg>
        </View>
    );
};

export default GrowthChart;
