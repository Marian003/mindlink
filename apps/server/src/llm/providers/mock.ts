import type { LLMProvider, LLMRequest } from "../types";

// Canned responses per agent — used when real API keys aren't configured
const AGENT_RESPONSES: Record<string, string> = {
  sage: `Great question. After reviewing the document context, I'd focus on three principles: scalability through stateless services, resilience through circuit breakers and retries, and observability through structured logging and distributed tracing. For real-time apps specifically, PostgreSQL with LISTEN/NOTIFY or a purpose-built solution like Redis Streams often beats the complexity of a full message broker at this scale. Start simple, measure, then optimize.`,

  spark: `Ooh, this opens up some exciting directions! What if we flipped the model entirely — instead of clients pulling state, we push a full reactive graph that computes derived state at the edge? Think CRDTs for conflict resolution, event-sourcing for history, and a declarative query language over live data streams. We could borrow from how biological systems handle distributed consensus — no central coordinator, just emergent agreement. The wild idea: what if the "database" is just a materialized view of a collaborative document?`,

  lens: `Code review perspective: a few things catch my eye. First, error boundaries — what happens when the WebSocket drops mid-operation? The happy path is clean but the failure modes need explicit handling. Second, the data transformation logic should be extracted into pure, testable functions rather than living inline in components. Third, check for stale closure issues in any useEffect that captures props — this is a common React footgun. These are prioritized: error handling is a P1, the others are P2.`,

  atlas: `Let me map this to an execution plan. I see three clear workstreams: (1) Infrastructure — finalize data model and API contracts this week, (2) Feature build — implement core flows with daily check-ins, (3) Validation — dedicated testing sprint before any external demo. Main risk: scope expansion. Define the MVP contract now and put new ideas in a backlog. Who's the DRI on the implementation decision, and what's the hard deadline we're working back from?`,

  echo: `User perspective check: before we commit to this direction, I want to validate some assumptions. Users in similar systems consistently struggle with three things — discoverability (they don't know what's possible), recovery from errors (the system doesn't tell them what went wrong or what to do next), and cognitive load from too many options at once. Have we done even a 5-person usability test on the current flow? The best architecture is one real people can actually navigate. Let's not optimize the wrong thing.`,

  ghost: `Security audit flag: I'm seeing a few surfaces that need attention before this goes anywhere near production. Input validation — never trust client-submitted data, especially room names and slugs that get stored and re-rendered. Token expiry — short-lived access tokens with refresh, not long-lived sessions. Data classification — which fields contain PII? Those need encryption at rest. Run a threat model against the authentication flow specifically: what's the blast radius if a session token is stolen? Design your security posture around your worst-case scenario, not your average case.`,
};

const DEFAULT_RESPONSE = `I've reviewed the current context and I have some thoughts to share. The key here is balancing pragmatic short-term needs against longer-term architectural goals. Whatever approach we take, it should be reversible and measurable — avoid irreversible decisions under uncertainty. I'd suggest starting with a small, focused experiment to validate the core assumption before committing to a full implementation.`;

function pickResponse(systemPrompt: string): string {
  const sp = systemPrompt.toLowerCase();
  for (const [slug, response] of Object.entries(AGENT_RESPONSES)) {
    if (sp.includes(`you are ${slug}`)) return response;
  }
  // Fall back to keyword matching
  if (sp.includes("architect") || sp.includes("sage")) return AGENT_RESPONSES.sage;
  if (sp.includes("creative") || sp.includes("spark")) return AGENT_RESPONSES.spark;
  if (sp.includes("review") || sp.includes("lens")) return AGENT_RESPONSES.lens;
  if (sp.includes("project") || sp.includes("atlas")) return AGENT_RESPONSES.atlas;
  if (sp.includes("user research") || sp.includes("echo")) return AGENT_RESPONSES.echo;
  if (sp.includes("security") || sp.includes("ghost")) return AGENT_RESPONSES.ghost;
  return DEFAULT_RESPONSE;
}

export const mockProvider: LLMProvider = {
  async *stream(params: LLMRequest): AsyncIterable<string> {
    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 1200));

    const text = pickResponse(params.systemPrompt ?? "");
    const tokens = text.split(/(\s+)/);

    for (const token of tokens) {
      yield token;
      // Simulate realistic typing speed (~40 chars/sec with variance)
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
    }
  },

  async complete(params: LLMRequest): Promise<string> {
    await new Promise((r) => setTimeout(r, 2000));
    return pickResponse(params.systemPrompt ?? "");
  },
};
