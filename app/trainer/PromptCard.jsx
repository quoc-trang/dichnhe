"use client";

import { styles } from "./styles";

export function PromptCard({ current, count, genLoading }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.badge}>#{String(count).padStart(2, "0")}</span>
        {current && !genLoading && <span style={styles.hint}>{current.hint}</span>}
      </div>
      {genLoading ? (
        <div style={styles.viWrap}>
          <p style={{ ...styles.vi, color: "#c9b676" }} className="pulse">
            thinking of a sentence…
          </p>
        </div>
      ) : (
        <div style={styles.viWrap}>
          <p style={styles.vi} className="pop">
            {current ? current.vi : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
