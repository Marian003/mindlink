"use client";

interface CursorRendererProps {
  color: string;
  name: string;
}

export function CursorRenderer({ color, name }: CursorRendererProps) {
  return (
    <span
      style={{
        borderLeft: `2px solid ${color}`,
        marginLeft: "-1px",
        position: "relative",
        display: "inline-block",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-1.4em",
          left: "-1px",
          backgroundColor: color,
          color: "#fff",
          fontSize: "11px",
          fontWeight: 600,
          padding: "1px 6px",
          borderRadius: "3px",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: "1.4",
        }}
      >
        {name}
      </span>
    </span>
  );
}
