import React from "react";

export default function FooterLayout({ title, subtitle, children }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ color: "#666", marginTop: 8 }}>{subtitle}</p>}
      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  );
}
