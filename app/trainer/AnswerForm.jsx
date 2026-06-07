"use client";

import { styles } from "./styles";

export function AnswerForm({
  answer,
  setAnswer,
  onScore,
  onGenerate,
  scoreLoading,
  genLoading,
}) {
  const disabled = !answer.trim() || scoreLoading || genLoading;

  return (
    <>
      <textarea
        style={styles.input}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onScore();
        }}
        placeholder="Type your English here ✏️"
        disabled={scoreLoading || genLoading}
        rows={3}
      />

      <div style={styles.actions}>
        <button
          style={{
            ...styles.btn,
            ...styles.btnPrimary,
            opacity: disabled ? 0.55 : 1,
          }}
          onClick={onScore}
          disabled={disabled}
        >
          {scoreLoading ? "checking…" : "Check ✨"}
        </button>
        <button
          style={{
            ...styles.btn,
            ...styles.btnGhost,
            opacity: genLoading ? 0.55 : 1,
          }}
          onClick={onGenerate}
          disabled={genLoading}
        >
          New ↻
        </button>
      </div>
    </>
  );
}
