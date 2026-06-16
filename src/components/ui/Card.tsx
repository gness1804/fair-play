import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** elev-1 (default) or elev-2 for a more raised surface. */
  elevation?: 1 | 2;
}

export function Card({ elevation = 1, className, children, ...rest }: CardProps) {
  const classes = [
    styles.card,
    elevation === 2 ? styles.elev2 : styles.elev1,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.header, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.body, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
