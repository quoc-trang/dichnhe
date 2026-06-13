// app/trainer/PromptCard.jsx
"use client";

import { styles } from "./styles";

export function PromptCard({ current, count, genLoading }) {
  const isStreaming = genLoading && current?.vi;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.badge}>#{String(count).padStart(2, "0")}</span>
        {current?.hint && !genLoading && <span style={styles.hint}>{current.hint}</span>}
      </div>

      {genLoading && !current?.vi ? (
        // Lúc chờ chunk đầu tiên (~100-200ms)
        <div style={styles.viWrap}>
          <p style={{ ...styles.vi, color: "#c9b676" }} className="pulse">
            thinking of a sentence…
          </p>
        </div>
      ) : (
        // Đang stream hoặc đã xong
        <div style={styles.viWrap}>
          <p style={styles.vi} className={isStreaming ? "" : "pop"}>
            {current?.vi || "—"}
            {isStreaming && <span style={styles.cursor}>▍</span>}
          </p>
        </div>
      )}
    </div>
  );
}