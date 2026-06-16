import styles from "./Gauge.module.css";

export interface GaugeProps {
  /** Share of weighted load carried by the first partner, 0–100. */
  value: number;
  leftLabel?: string;
  rightLabel?: string;
  /** Accessible name for the gauge. */
  ariaLabel?: string;
}

/**
 * A two-sided share gauge for the "light equity view" — deliberately framed as
 * a split, not a score. `value` is the left partner's percentage of weighted
 * load; the remainder is the right partner's.
 */
export function Gauge({
  value,
  leftLabel = "You",
  rightLabel = "Partner",
  ariaLabel,
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 50));
  const left = Math.round(clamped);
  const right = 100 - left;

  return (
    <div className={styles.gauge}>
      <div className={styles.labels}>
        <span className={styles.label}>
          {leftLabel} · {left}%
        </span>
        <span className={styles.label}>
          {rightLabel} · {right}%
        </span>
      </div>
      <div
        className={styles.track}
        role="meter"
        aria-valuenow={left}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? `${leftLabel} ${left}%, ${rightLabel} ${right}%`}
      >
        <div className={styles.fill} style={{ width: `${left}%` }} />
      </div>
    </div>
  );
}
