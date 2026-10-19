"use client";

import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  industry: string | null;
  stage: string | null;
  location: string | null;
  _count: { jobs: number };
};

type CompanyResponse = {
  data: Company[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export default function Companies() {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCompanies() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (q.trim()) params.set("q", q.trim());
      if (loc.trim()) params.set("location", loc.trim());

      try {
        const response = await fetch(`/api/companies?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("The company directory is temporarily unavailable.");
        const payload = (await response.json()) as CompanyResponse;
        if (!Array.isArray(payload.data) || !payload.pagination) {
          throw new Error("The company directory returned an unexpected response.");
        }
        setResult(payload);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load companies. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCompanies();
    return () => controller.abort();
  }, [q, loc, page, retry]);

  return <><header className="topbar"><div className="shell nav"><a className="brand" href="/"><span className="brand-mark">C</span> community<span style={{color:"var(--blue)"}}>jobs</span></a><nav className="navlinks"><a href="/">Jobs</a><a className="active" href="/companies">Companies</a></nav><div className="navright"><a className="button" href="/">Browse jobs</a><a className="button primary" href="/join-talent-network">Join talent network ↗</a></div></div></header>
  <main className="shell"><div className="pagehead"><div className="eyebrow">Meet the teams behind the work</div><h1>Explore companies</h1><p className="muted">Discover employers and explore their published opportunities.</p><div className="searchbox" style={{gridTemplateColumns:"1.4fr 1fr"}}><div className="searchfield"><span>⌕</span><input aria-label="Search companies" placeholder="Search by name or keyword" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div><div className="searchfield"><span>⌖</span><input aria-label="Company location" placeholder="Location" value={loc} onChange={e=>{setLoc(e.target.value);setPage(1)}}/></div></div></div>
  <div className="muted" aria-live="polite">{loading ? "Loading companies…" : result ? `${result.pagination.total} companies` : "Company directory"}</div>
  {error && <div className="notice" role="alert">{error} <button className="button" onClick={()=>setRetry(n=>n+1)}>Try again</button></div>}
  {!error && !loading && result?.data.length === 0 && <div className="empty"><h3>No companies found</h3><p className="muted">Try another keyword or location.</p><button className="button" onClick={()=>{setQ("");setLoc("");setPage(1)}}>Clear search</button></div>}
  <div className="companygrid" aria-busy={loading}>{result?.data.map(c=><article className="companycard" key={c.id}><div className="jobrow">{c.logoUrl ? <img src={c.logoUrl} alt="" className="company-logo" style={{objectFit:"contain"}}/> : <div className="company-logo">{c.name.slice(0,1).toUpperCase()}</div>}<div><h3 style={{margin:"2px 0 5px"}}>{c.name}</h3>{c.stage&&<span className="tag blue">{c.stage}</span>}</div></div>{c.description&&<p className="muted" style={{lineHeight:1.65,minHeight:66}}>{c.description}</p>}<div className="jobmeta">{c.location&&<span>⌖ {c.location}</span>}{c.industry&&<span>▧ {c.industry}</span>}</div><div style={{borderTop:"1px solid var(--line)",marginTop:16,paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="muted">{c._count.jobs} published {c._count.jobs===1?"role":"roles"}</span><a href="/" style={{color:"var(--blue)",fontWeight:700}}>Browse jobs →</a></div></article>)}</div>
  {result && result.pagination.pages > 1 && <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10,margin:"24px 0 48px"}}><button className="button" disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>← Previous</button><span className="muted">Page {page} of {result.pagination.pages}</span><button className="button" disabled={page>=result.pagination.pages||loading} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
  {!loading && !error && result?.data.length === 0 && <p className="notice">Companies appear here when they have been added to the database. Sample companies are no longer shown as live profiles.</p>}
  </main><footer className="footer"><div className="shell">© 2026 Community Jobs · Independent demo implementation</div></footer></>;
}
