// Calls OUR route handler, not the LLM provider directly. The key lives on the server.
export async function api(type, payload) {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Request failed");
  }
  return res.json();
}
