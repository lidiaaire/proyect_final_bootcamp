import styles from "./DonutChart.module.css";

// Donut de estados (dashboard, referencia visual contractual): SVG hand
// -rolled sobre agregaciones reales (conteos por estado ya calculados en
// pages/index.js) -- sin librería de gráficas, sin datos inventados.
// `segments`: [{ label, value, tone }]. El total y cada % se derivan de
// los propios `value`, nunca se piden aparte.
const SIZE = 120;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ segments, total }) {
  const sum = total ?? segments.reduce((acc, s) => acc + s.value, 0);
  let offset = 0;

  return (
    <div className={styles.wrap}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--bg-surface-2)"
          strokeWidth={STROKE}
        />
        {sum > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const fraction = s.value / sum;
              const dash = fraction * CIRCUMFERENCE;
              const dashArray = `${dash} ${CIRCUMFERENCE - dash}`;
              const dashOffset = -offset;
              offset += dash;

              return (
                <circle
                  key={s.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={`var(--${s.tone})`}
                  strokeWidth={STROKE}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  strokeLinecap="butt"
                />
              );
            })}
      </svg>
      <div className={styles.center}>
        <span className={styles.centerValue}>{sum}</span>
        <span className={styles.centerLabel}>Total</span>
      </div>
    </div>
  );
}
