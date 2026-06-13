"use client";

import { useState, useRef } from "react";
import { api, streamApi } from "./api";
import { DIFFICULTIES } from "./constants";

// All trainer state + actions live here. The UI components stay pure presentational.
export function useTrainer() {
  const [difficulty, setDifficulty] = useState("intermediate");
  const [topic, setTopic] = useState("everyday life");
  const [current, setCurrent] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [count, setCount] = useState(0);
  const seen = useRef([]);

  function parseStreamedGenerate(text) {
    const viMatch = text.match(/VI:\s*(.+?)(?=\nHINT:|$)/s);
    const hintMatch = text.match(/HINT:\s*(.+?)$/s);
    return {
      vi: viMatch?.[1]?.trim() || '',
      hint: hintMatch?.[1]?.trim() || '',
    };
  }

  async function generate() {
    setGenLoading(true);
    setError("");
    setResult(null);
    setAnswer("");
    setCurrent({ vi: '', hint: '' });
    const d = DIFFICULTIES.find((x) => x.key === difficulty);
    let streamedText = '';
    await streamApi(
      'generate',
      {
        difficulty,
        difficultyDesc: d.desc,
        topic,
        avoid: seen.current.slice(-8),
      },
      {
        onChunk: (chunk) => {
          streamedText += chunk;
          // Parse từng dòng VI: / HINT:
          const parsed = parseStreamedGenerate(streamedText);
          setCurrent(parsed);
        },
        onDone: () => {
          const final = parseStreamedGenerate(streamedText);
          if (final.vi) {
            seen.current.push(final.vi);
            setCount((c) => c + 1);
          }
          setGenLoading(false);
        },
        onError: (err) => {
          setError(err.message || "Couldn't generate a sentence 🥺");
          setGenLoading(false);
        },
      },
    );
  }

  async function score() {
    if (!answer.trim() || scoreLoading || !current) return;
    setScoreLoading(true);
    setError("");
    setResult(null);
    try {
      const parsed = await api("score", {
        vi: current.vi,
        answer: answer.trim(),
      });
      setResult(parsed);
      setStreak((s) => (parsed.score >= 80 ? s + 1 : 0));
    } catch (e) {
      setError(e.message || "Something went wrong scoring your answer 🥺");
    } finally {
      setScoreLoading(false);
    }
  }

  return {
    // state
    difficulty,
    topic,
    current,
    answer,
    result,
    error,
    streak,
    count,
    genLoading,
    scoreLoading,
    // setters
    setDifficulty,
    setTopic,
    setAnswer,
    // actions
    generate,
    score,
  };
}
