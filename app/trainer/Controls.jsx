"use client";

import { DIFFICULTIES, TOPICS } from "./constants";
import { styles } from "./styles";

export function Controls({ difficulty, setDifficulty, topic, setTopic }) {
  return (
    <div style={styles.controls}>
      <div style={styles.pills}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            onClick={() => setDifficulty(d.key)}
            style={{
              ...styles.pill,
              ...(difficulty === d.key ? styles.pillActive : {}),
            }}
          >
            <span>{d.emoji}</span> {d.label}
          </button>
        ))}
      </div>
      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={styles.select}
      >
        {TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
