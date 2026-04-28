// Function classifier — maps a job (title + description) into one of 6
// HR-relevant buckets. First-match-wins from top to bottom: more specific
// rules sit higher so "Trade Surveillance" goes to Compliance, not Trading.
//
// Compared to the old 3-bucket version (Sales / Compliance / Marketing),
// this adds Trading (dealing-desk + quant + market-making), Tech/Engineering
// (every kind of dev / SRE / data role), and Operations (back-office,
// onboarding, settlements, finance). Jobs that match nothing are dropped.

export const FUNCTION_RULES = [
  ["Compliance / Risk", [
    "compliance", "regulatory", "regulation",
    "legal counsel", "in-house counsel", "in house counsel",
    "aml", "anti-money", "anti money", "transaction monitoring", "financial crime",
    "kyc", "kyb", "due diligence",
    "market surveillance", "trade surveillance", "surveillance analyst",
    "credit risk", "operational risk", "market risk",
    "risk manager", "risk analyst", "risk officer", "risk specialist",
    "mlro", "dpo", "data protection officer",
    "fca", "bafin", "knf", "finma", "cysec", "cvm", "dfsa", "fsa",
    "conduct risk", "compliance officer", "compliance analyst",
    "fraud", "sanctions", "audit", "internal audit",
  ]],
  ["Trading / Dealing", [
    "trader", "trading desk", "dealing desk", "dealer",
    "market maker", "market making", "liquidity provider", "liquidity manager",
    "quant", "quantitative", "execution trader",
    "fx trader", "cfd trader", "dealing operations",
    "head of trading", "head of dealing",
  ]],
  ["Sales / BD", [
    "institutional sales", "b2b sales", "prime brokerage",
    "family office", "business development",
    "sales executive", "sales manager", "account manager", "account executive",
    "partnerships", "introducing broker", "ib manager", "ib partnership",
    "country manager", "regional manager", "head of sales",
    "vp sales", "vp of sales",
    "sales", "bd manager", "relationship manager",
  ]],
  ["Marketing", [
    "performance marketing", "growth marketing", "marketing manager",
    "content manager", "content marketing", "brand manager",
    "seo", "sem", "ppc", "paid media", "paid social",
    "crm marketing", "lifecycle marketing", "email marketing",
    "social media", "community manager",
    "marketing", "brand", "pr manager", "communications manager",
  ]],
  ["Tech / Engineering", [
    "software engineer", "software developer", "backend engineer", "front-end engineer",
    "frontend engineer", "fullstack", "full-stack", "full stack",
    "devops", "site reliability", "sre", "platform engineer",
    "data engineer", "data scientist", "machine learning", "ml engineer",
    "ai engineer", "qa engineer", "test engineer", "automation engineer",
    "security engineer", "infosec", "cybersecurity",
    "mobile developer", "ios engineer", "android engineer",
    "engineering manager", "head of engineering", "tech lead",
    "developer", "engineer", "architect",
  ]],
  ["Operations", [
    "client onboarding", "client services", "customer support",
    "back office", "back-office", "settlements", "payments operations",
    "treasury", "finance manager", "financial controller", "controller",
    "accounting", "accountant", "fp&a",
    "hr business partner", "hrbp", "talent acquisition", "recruiter", "recruitment",
    "people operations", "people partner",
    "office manager", "office administrator",
    "operations manager", "operations analyst", "trade support",
  ]],
];

export function classifyJob(job) {
  const haystack = `${job.title || ""} \n ${job.description || ""}`.toLowerCase();
  if (!haystack.trim()) return null;
  for (const [label, terms] of FUNCTION_RULES) {
    for (const term of terms) {
      if (haystack.includes(term)) return label;
    }
  }
  return null;
}
