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


export async function streamApi(type, payload, { onChunk, onDone, onError }) {
  let res;
  try {
    res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
  } catch (err) {
    onError(err);
    return;
  }

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    onError(new Error(errJson.error || 'Stream failed'));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode bytes → text, append vào buffer
      buffer += decoder.decode(value, { stream: true });

      // Tách SSE events bằng \n\n
      const events = buffer.split('\n\n');
      // Phần cuối có thể chưa hoàn chỉnh → giữ lại trong buffer
      buffer = events.pop() || '';

      for (const event of events) {
        if (!event.startsWith('data: ')) continue;
        const data = event.slice(6).trim();

        if (data === '[DONE]') {
          onDone();
          return;
        }

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // ignore malformed lines
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}