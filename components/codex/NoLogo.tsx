"use client";

export function NoLogo() {
  return (
    <span style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }} aria-hidden="true">
      <span className="no-logo-halo" />
      <span className="no-logo-ring no-logo-ring-1" />
      <span className="no-logo-ring no-logo-ring-2" />
      <span className="no-logo-core" />
    </span>
  );
}
