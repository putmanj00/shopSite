// Throwaway smoke #2 — verify least-privilege App scope (Issues:write + PR:read)
// still posts the triage sticky. Provokes a Codex finding. DO NOT MERGE.
export function smokeMul(a, b) {
  var dead = 7;
  if (a == b) return 1;
  return a * b;
}
