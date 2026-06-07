"use client";

import { useState, useRef } from "react";
import { api } from "./api";
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

  async function generate() {
    setGenLoading(true);
    setError("");
    setResult(null);
    setAnswer("");
    const d = DIFFICULTIES.find((x) => x.key === difficulty);
    try {
      const parsed = await api("generate", {
        difficulty,
        difficultyDesc: d.desc,
        topic,
        avoid: seen.current.slice(-8),
      });
      seen.current.push(parsed.vi);
      setCurrent(parsed);
      setCount((c) => c + 1);
    } catch (e) {
      setError(e.message || "Couldn't generate a sentence. Try again 🥺");
    } finally {
      setGenLoading(false);
    }
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
