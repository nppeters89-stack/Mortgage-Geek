// Shared lead-pipeline store: one GET hydrates the whole namespace, a
// localStorage cache carries it across tab switches, and writes are
// optimistic with keepalive durability, mirroring prospectStore. Lead data
// never leaves Redis plus this session cache.

import { fetchLeads, saveLeadKind, saveLeadKindKeepalive } from "../../../utils/geeklogApi";

const LS_KEY = "gl2:leads:v1";
let cache = null; // { contacts, fu, status, accounts, config }

function loadLS() {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveLS(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch { /* best-effort */ }
}

export function getCachedLeads() {
  if (!cache) cache = loadLS();
  return cache;
}

export async function loadLeads(apiKey) {
  const data = await fetchLeads(apiKey);
  cache = {
    contacts: data.contacts || {},
    fu: data.fu || {},
    status: data.status || {},
    config: data.config || {},
  };
  saveLS(cache);
  return cache;
}

const mutate = (patch) => {
  const c = getCachedLeads() || { contacts: {}, fu: {}, status: {}, accounts: {}, config: {} };
  cache = { ...c, ...patch };
  saveLS(cache);
  return cache;
};

export function persistLeadTouch(apiKey, id, touches) {
  const c = getCachedLeads() || { fu: {} };
  mutate({ fu: { ...c.fu, [id]: touches } });
  const touch = touches[touches.length - 1];
  saveLeadKindKeepalive(apiKey, { kind: "lead.touch", id, touch });
  return saveLeadKind(apiKey, { kind: "lead.touch", id, touch });
}

export function persistLead(apiKey, contact) {
  const id = String(contact.phone || "").replace(/\D/g, "");
  const c = getCachedLeads() || { contacts: {} };
  mutate({ contacts: { ...c.contacts, [id]: { ...contact, kind: "lead" } } });
  return saveLeadKind(apiKey, { kind: "lead.save", contact });
}

export function persistLeadStatus(apiKey, id, track, expiryTs) {
  const c = getCachedLeads() || { status: {} };
  const status = { ...c.status };
  if (track) status[id] = { track, ts: Date.now(), ...(expiryTs ? { expiryTs } : {}) };
  else delete status[id];
  mutate({ status });
  return saveLeadKind(apiKey, { kind: "lead.status", id, track: track || "", ...(expiryTs ? { expiryTs } : {}) });
}


export function deleteLead(apiKey, id) {
  const c = getCachedLeads() || { contacts: {}, fu: {}, status: {} };
  const contacts = { ...c.contacts }; delete contacts[id];
  const fu = { ...c.fu }; delete fu[id];
  const status = { ...c.status }; delete status[id];
  mutate({ contacts, fu, status });
  return saveLeadKind(apiKey, { kind: "lead.delete", id });
}

