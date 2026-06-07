"use client";

import { styles } from "./styles";

export function Header({ streak }) {
  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logo}>🐤</div>
        <div>
          <div style={styles.brandName}>Dịch nhé</div>
          <div style={styles.brandSub}>vietnamese → english</div>
        </div>
      </div>
      <div style={styles.streak}>
        <span style={styles.fire}>🔥</span>
        <span style={styles.streakNum}>{streak}</span>
      </div>
    </header>
  );
}
