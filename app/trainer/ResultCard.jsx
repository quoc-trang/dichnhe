"use client";

import { styles, scoreColor, scoreFace } from "./styles";

export function ResultCard({ result, onNext }) {
  return (
    <div style={styles.result} className="pop">
      <div style={styles.scoreRow}>
        <div
          style={{
            ...styles.scoreCircle,
            background: scoreColor(result.score),
          }}
        >
          <span style={styles.scoreNum}>{result.score}</span>
        </div>
        <div>
          <div style={styles.verdict}>
            {scoreFace(result.score)} {result.verdict}
          </div>
          <div style={styles.scoreSub}>out of 100</div>
        </div>
      </div>

      <p style={styles.feedback}>{result.feedback}</p>

      {result.errors && result.errors.length > 0 && (
        <div style={styles.errors}>
          {result.errors.map((e, i) => (
            <span key={i} style={styles.errorChip}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div style={styles.correctionBox}>
        <div style={styles.correctionLabel}>✓ natural version</div>
        <div style={styles.correction}>{result.correction}</div>
      </div>

      <button
        style={{
          ...styles.btn,
          ...styles.btnPrimary,
          width: "100%",
          marginTop: 16,
        }}
        onClick={onNext}
      >
        Next one →
      </button>
    </div>
  );
}
