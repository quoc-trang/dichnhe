"use client";

import { useTrainer } from "./trainer/useTrainer";
import { styles } from "./trainer/styles";
import { Header } from "./trainer/Header";
import { Controls } from "./trainer/Controls";
import { PromptCard } from "./trainer/PromptCard";
import { AnswerForm } from "./trainer/AnswerForm";
import { ResultCard } from "./trainer/ResultCard";
import { useEffect } from 'react';

export default function TranslateTrainer() {
  const t = useTrainer();
  useEffect(() => {
    t.generate()
  }, [])

  return (
    <div style={styles.root}>
      <div style={styles.blobA} />
      <div style={styles.blobB} />

      <div style={styles.shell}>
        <Header streak={t.streak} />

        <Controls
          difficulty={t.difficulty}
          setDifficulty={t.setDifficulty}
          topic={t.topic}
          setTopic={t.setTopic}
        />

        <PromptCard
          current={t.current}
          count={t.count}
          genLoading={t.genLoading}
        />

        <AnswerForm
          answer={t.answer}
          setAnswer={t.setAnswer}
          onScore={t.score}
          onGenerate={t.generate}
          scoreLoading={t.scoreLoading}
          genLoading={t.genLoading}
        />

        {t.error && <div style={styles.error}>{t.error}</div>}

        {t.result && <ResultCard result={t.result} onNext={t.generate} />}

        <div style={styles.kbd}>press ⌘ / Ctrl + Enter to check</div>
      </div>
    </div>
  );
}
