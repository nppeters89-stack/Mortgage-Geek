import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps, persistSoi, setCachedSoi, persistRac, setCachedRac, persistMotivation, setCachedMotivation } from "./prospectStore";
import { idFromPhone, soiQueue, formatSoiSince, manualContactTsvRow, referralsOf, quadrantOf, lastTouchByTs, STAGE_REFERRAL, DEFAULT_STAGES, DEFAULT_CONFIG } from "./prospectsModel";
import { copyText } from "./clipboard";
import { FollowUpDetail } from "./FollowUpDetail";
import { persistSoiCategory } from "./prospectStore";
import { SoiCockpit, SoiPartnerContent, SOI_GROUPS, soiGroupColor } from "./SoiCockpit";
import { fireConfetti } from "./confetti";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { quietAction } from "./detailActionStyles";

// SOI (sphere of influence): contacts promoted out of Follow Ups after they send
// a referral. Unlike Follow Ups, membership is stored (a Redis hash of id to
// promotion date), not derived from the call score.
//
// Two clocks drive the whole view: last touch (what Nick did) and last referral
// (what the partner sent, stage -3 in the same fu history). Desktop (>= 900px)
// renders the SoiCockpit quadrant grid; mobile renders the same data as
// priority groups. The detail is the shared FollowUpDetail with the two-mode
// touch/referral composer. A promotion moves no data, so removing someone drops
// them back into Follow Ups with every touch - and every referral - intact.
export function SoiContent({ apiKey, onOpenFollowUps }) {
  const seed = getCachedProspects();
  const [profile, setProfile] = useState(() => seed?.profile || {});
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [soi, setSoi] = useState(() => seed?.soi || {});
  const [rac, setRac] = useState(() => seed?.rac || []);
  const [motivation, setMotivation] = useState(() => seed?.motivation || {});
  const [stages, setStages] = useState(() => seed?.stages || DEFAULT_STAGES);
  const [config, setConfig] = useState(() => seed?.config || DEFAULT_CONFIG);
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps);
  fuRef.current = followUps;
  const soiRef = useRef(soi);
  soiRef.current = soi;
  const racRef = useRef(rac);
  racRef.current = rac;
  const motivationRef = useRef(motivation); motivationRef.current = motivation;
  const goalIndex = stages.length - 1;

  // Same responsive branch as the Follow Up cockpit: quadrants at >= 900px.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    loadProspects(apiKey)
      .then((c) => {
        setProfile(c.profile || {});
        if (cancelled) return;
        setProspects(c.prospects);
        setLogs(c.logs);
        setFollowUps(c.followUps);
        setSoi(c.soi || {});
        setRac(c.rac || []);
        setMotivation(c.motivation || {});
        setStages(Array.isArray(c.stages) && c.stages.length ? c.stages : DEFAULT_STAGES);
        setConfig(c.config || DEFAULT_CONFIG);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const queue = useMemo(() => soiQueue(prospects, soi, followUps), [prospects, soi, followUps]);
  const racSet = useMemo(() => new Set(rac), [rac]);
  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  // Same key as Follow Ups; SOI touches carry the goal stage so the ratchet
  // keeps reading SOI members at the goal even if they are later demoted.
  const handleLogFollowUp = useCallback((id, note, ts, talked) => {
    const touch = { ts: Number.isFinite(ts) ? ts : Date.now(), note, stage: goalIndex };
    if (talked === true) touch.talked = true;
    const next = [...(fuRef.current[id] || []), touch];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast("Touch logged");
  }, [apiKey, showToast, goalIndex]);

  // A referral event: stage -3 in the same history, so it survives promotion,
  // demotion, and re-seeds. Gold treatment everywhere, confetti here.
  const handleLogReferral = useCallback((id, note, name, ts) => {
    const next = [...(fuRef.current[id] || []), { ts: Number.isFinite(ts) ? ts : Date.now(), note, stage: STAGE_REFERRAL }];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    fireConfetti();
    showToast(name ? `Referral logged for ${name}` : "Referral logged");
  }, [apiKey, showToast]);

  // Same motivation note as Follow Ups, on the same shared key.
  const handleSaveMotivation = useCallback((id, text) => {
    const prev = motivationRef.current;
    const next = { ...prev };
    const value = (text || "").trim();
    if (value) next[id] = value; else delete next[id];
    setMotivation(next);
    showToast(value ? "Motivation saved" : "Motivation cleared");
    persistMotivation(apiKey, id, value).catch(() => {
      setMotivation(prev);
      setCachedMotivation(prev);
      showToast("Could not save motivation");
    });
  }, [apiKey, showToast]);

  // Same RAC toggle as Follow Ups, on the same shared key, so a contact marked in
  // one view is marked in the other.
  const toggleRac = useCallback((id) => {
    const prev = racRef.current;
    const adding = !prev.includes(id);
    setRac(adding ? [...prev, id] : prev.filter((x) => x !== id));
    showToast(adding ? "Added to RAC" : "RAC mark cleared");
    persistRac(apiKey, id, adding ? "add" : "remove").catch(() => {
      setRac(prev);
      setCachedRac(prev);
      showToast("Could not update RAC");
    });
  }, [apiKey, showToast]);

  // Demote: optimistic, back to the queue, revert both this view and the shared
  // cache if the write fails. Nothing is deleted, so the contact reappears in
  // Follow Ups on the strength of its original call score.
  const handleRemoveFromSoi = useCallback((id) => {
    const prev = soiRef.current;
    const next = { ...prev };
    delete next[id];
    setSoi(next);
    setView("queue");
    setOpenId(null);
    showToast("Removed from SOI");
    persistSoi(apiKey, id, "remove").catch(() => {
      setSoi(prev);
      setCachedSoi(prev);
      showToast("Could not update SOI");
    });
  }, [apiKey, showToast]);

  // The shared detail, used by the mobile full page and the desktop modal.
  const buildDetail = (id, { modal = false } = {}) => {
    const p = prospects.find((x) => idFromPhone(x.phone) === id);
    if (!p) return null;
    const refCount = referralsOf(followUps[id] || []).length;
    const since = formatSoiSince(soi[id]);
    return (
      <FollowUpDetail
        profile={profile[id] || null}
        prospect={p}
        log={logs[id]}
        touches={followUps[id] || []}
        onBack={() => { setView("queue"); setOpenId(null); }}
        composerMode="soi"
        onLogFollowUp={(note, _stage, ts, talked) => handleLogFollowUp(id, note, ts, talked)}
        onLogReferral={(note, ts) => handleLogReferral(id, note, p.name, ts)}
        statusLine={`${since ? `SOI since ${since}` : "SOI"} · ${refCount} referral${refCount === 1 ? "" : "s"}`}
        onToast={showToast}
        copyPhoneOnTap={modal}
        motivation={motivation[id] || ""} onSaveMotivation={(text) => handleSaveMotivation(id, text)}
        onCopyForExcel={p.manual ? () => copyText(manualContactTsvRow(p)).then(
          () => showToast("Contact row copied"),
          () => showToast("Copy failed"),
        ) : null}
        inRac={racSet.has(id)}
        onToggleRac={() => toggleRac(id)}
        backLabel="SOI"
        showStageTags stages={stages}
        footerAction={
          <button type="button" onClick={() => handleRemoveFromSoi(id)} style={quietAction}>
            Remove from SOI
          </button>
        }
      />
    );
  };

  // ----- Desktop: the quadrant cockpit, detail in a modal -----
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100%" }}>
        <StatusBarCap />
        <SoiCockpit
          onCategorize={(id, category) => {
            setSoi((prev) => {
              const v = prev[id];
              const ts = v && typeof v === "object" ? v.ts : Number(v) || Date.now();
              return { ...prev, [id]: { ...(typeof v === "object" ? v : {}), ts, category } };
            });
            persistSoiCategory(apiKey, id, category).catch(() => {});
          }}
          prospects={prospects} soi={soi} followUps={followUps} config={config} racSet={racSet}
          onOpenDetail={(id) => { setOpenId(id); setView("detail"); }}
          onOpenFollowUps={onOpenFollowUps}
        />
        {view === "detail" && openProspect && (
          <div onClick={() => { setView("queue"); setOpenId(null); }} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 55, padding: "40px 20px", overflowY: "auto" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 560, marginTop: 8 }}>
              {buildDetail(openId, { modal: true })}
            </div>
          </div>
        )}
        <Toast msg={toast} />
      </div>
    );
  }

  // ----- Mobile: full-page detail -----
  if (view === "detail" && openProspect) {
    const id = idFromPhone(openProspect.phone);
    return (
      <>
        <StatusBarCap />
        {buildDetail(id)}
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Queue view -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <StatusBarCap />
      <header style={{ position: "sticky", top: "calc(8px + env(safe-area-inset-top, 0px))", zIndex: 20, padding: "2px 20px 14px", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>SOI</h1>
          <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: T.green, fontWeight: 600 }}>{queue.length}</strong> in sphere
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 14px 0" }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? (
              <>No one in your sphere yet.<br />Add a contact from their Follow Ups detail once they refer you.</>
            ) : "Loading…"}
          </div>
        ) : (
          <>
            {SOI_GROUPS.map(({ qi, label, tone }) => {
              const items = queue
                .filter((p) => quadrantOf(followUps[idFromPhone(p.phone)] || [], config) === qi)
                .sort((a, b) => (lastTouchByTs(followUps[idFromPhone(a.phone)]) || 0) - (lastTouchByTs(followUps[idFromPhone(b.phone)]) || 0));
              if (!items.length) return null;
              return (
                <div key={qi}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: soiGroupColor(tone), padding: "18px 4px 4px" }}>{label}</div>
                  {items.map((p) => {
                    const id = idFromPhone(p.phone);
                    return (
                      <div key={id} role="button" tabIndex={0}
                        onClick={() => { setOpenId(id); setView("detail"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); setView("detail"); } }}
                        style={{ padding: "13px 4px", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
                        <SoiPartnerContent prospect={p} touches={followUps[id] || []} config={config} inRac={racSet.has(id)} nameSize={19} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: T.faint, padding: "16px 4px", lineHeight: 1.6 }}>Sorted by priority: partners you owe a thank-you touch first, then drifting, then the rest. Desktop shows the full quadrant view.</div>
          </>
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}
