// Server Component (App Router default) — renders the static shell with zero JS cost.
// The interactive trainer is a Client Component imported below.
import TranslateTrainer from "./TranslateTrainer";

export default function Page() {
  return <TranslateTrainer />;
}
