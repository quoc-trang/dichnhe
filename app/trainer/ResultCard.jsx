"use client";

import { styles, scoreColor, scoreFace } from "./styles";

export function ResultCard({ result, onNext }) {
  const vietnameseFeedback = result.vietnameseFeedback || result.feedback;
  const wordChanges = result.wordChanges || [];

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
          <div style={styles.scoreSub}>trên 100 điểm</div>
        </div>
      </div>

      {vietnameseFeedback && (
        <section style={styles.feedbackSection}>
          <div style={styles.feedbackLabel}>Tiếng Việt</div>
          <p style={styles.feedback}>{vietnameseFeedback}</p>
        </section>
      )}

      {wordChanges.length > 0 && (
        <section style={styles.changesBox}>
          <div style={styles.changesLabel}>Nên đổi chỗ nào?</div>
          <div style={styles.changesList}>
            {wordChanges.map((change, i) => (
              <div key={`${change.from}-${change.to}-${i}`} style={styles.changeItem}>
                <div style={styles.changePair}>
                  <span style={styles.changeFrom}>{change.from}</span>
                  <span style={styles.changeArrow}>→</span>
                  <span style={styles.changeTo}>{change.to}</span>
                </div>
                <p style={styles.changeReason}>{change.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <div style={styles.correctionLabel}>✓ bản tự nhiên hơn</div>
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
        Câu tiếp theo →
      </button>
    </div>
  );
}
