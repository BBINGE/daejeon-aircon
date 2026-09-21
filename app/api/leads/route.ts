import { env } from "cloudflare:workers";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { retentionDeadline } from "../../../db/retention";

const allowedStatuses = new Set(["new", "contacted", "quoting", "won", "completed", "hold", "closed"]);
const allowedOrigins = new Set(["https://naengnanmarket.com", "https://bbinge.github.io", "https://kimdaegon-aircon.bbinge95.chatgpt.site", "http://localhost:3000"]);
const inquiryTypes = new Set(["에어컨 설치", "이전설치", "철거", "무료수거", "중고 매입", "중고 에어컨 판매", "기타 상담"]);
const CONSENT_VERSION = "callback-lead-2026-09-21-v2";

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  return origin && allowedOrigins.has(origin) ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  } : {};
}

function json(request: Request, data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  for (const [name, value] of Object.entries(corsHeaders(request))) headers.set(name, value);
  return Response.json(data, { ...init, headers });
}

function isAllowedRequest(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || allowedOrigins.has(origin);
}

function isAdmin(request: Request) {
  const workerEnv = env as unknown as { ADMIN_KEY?: string };
  const supplied = request.headers.get("x-admin-key");
  return Boolean(workerEnv.ADMIN_KEY && supplied && supplied === workerEnv.ADMIN_KEY);
}

function cleanOptional(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

async function purgeExpired() {
  // Only explicitly closed, non-contract enquiries receive a deadline.
  await getDb().delete(leads).where(and(eq(leads.status, "closed"), lte(leads.deleteAfter, new Date().toISOString().slice(0, 19).replace("T", " "))));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return json(request, { error: "요청 형식을 확인해주세요." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 3000) return json(request, { error: "입력 내용이 너무 깁니다." }, { status: 413 });
  const workerEnv = env as unknown as { LEAD_NOTIFY_EMAIL?: string };
  if (!workerEnv.LEAD_NOTIFY_EMAIL) return json(request, { error: "지금은 온라인 접수를 받을 수 없습니다. 010-9183-2200으로 전화해주세요." }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 3000) return json(request, { error: "입력 내용이 너무 깁니다." }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
  } catch { return json(request, { error: "입력 내용을 다시 확인해주세요." }, { status: 400 }); }
  if (typeof body.website === "string" && body.website.trim()) return json(request, { ok: true });
  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  if (!/^0\d{8,10}$/.test(phone)) return json(request, { error: "연락받을 번호를 확인해주세요." }, { status: 400 });
  if (body.consent !== true) return json(request, { error: "개인정보 안내를 확인하고 동의해주세요." }, { status: 400 });
  const inquiryType = cleanOptional(body.inquiryType, 30) || "상담 요청";
  if (inquiryType !== "상담 요청" && !inquiryTypes.has(inquiryType)) return json(request, { error: "필요한 작업을 다시 선택해주세요." }, { status: 400 });
  const region = cleanOptional(body.region, 40)?.replace(/[\r\n\t]/g, " ") || "미기재";
  try {
    const database = getDb();
    const duplicateSince = new Date(Date.now() - 2 * 60_000).toISOString().slice(0, 19).replace("T", " ");
    const [duplicate] = await database.select({ id: leads.id }).from(leads).where(and(eq(leads.phone, phone), gte(leads.createdAt, duplicateSince))).limit(1);
    if (duplicate) return json(request, { ok: true, duplicate: true });
    const [saved] = await database.insert(leads).values({ phone, region, inquiryType, airconType: "미기재", consentVersion: CONSENT_VERSION, consentAt: new Date().toISOString() }).returning({ id: leads.id });
    if (!saved) throw new Error("접수 번호가 생성되지 않았습니다.");
    let notificationPending = false;
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(workerEnv.LEAD_NOTIFY_EMAIL)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Origin: "https://naengnanmarket.com", Referer: "https://naengnanmarket.com/" },
        body: JSON.stringify({ _subject: `새 상담 신청 #${saved.id}`, 접수번호: String(saved.id), 연락처: phone, 필요한작업: inquiryType, 지역: region, 접수처: "naengnanmarket.com" }),
        signal: AbortSignal.timeout(15000),
      });
      const notification = await response.json() as { success?: boolean | "true" };
      if (!response.ok || (notification.success !== true && notification.success !== "true")) throw new Error(`메일 알림 응답 ${response.status}`);
    } catch (error) {
      console.error("PC 상담 알림 발송 실패", saved.id, error instanceof Error ? `${error.name}: ${error.message}` : String(error));
      notificationPending = true;
    }
    return json(request, { ok: true, notificationPending });
  } catch (error) {
    console.error("PC 상담 접수 실패", error);
    return json(request, { error: "접수되지 않았습니다. 잠시 후 다시 시도하거나 010-9183-2200으로 전화해주세요." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
  if (!isAdmin(request)) return json(request, { error: "관리자 인증이 필요합니다." }, { status: 401 });
  try {
    await purgeExpired();
    const rows = await getDb().select().from(leads).orderBy(desc(leads.id)).limit(500);
    return json(request, { ok: true, leads: rows });
  } catch { return json(request, { error: "문의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
  if (!isAdmin(request)) return json(request, { error: "관리자 인증이 필요합니다." }, { status: 401 });
  try {
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  const status = cleanOptional(body.status, 20);
  if (!Number.isInteger(id) || id < 1 || !status || !allowedStatuses.has(status)) return json(request, { error: "변경할 상태를 확인해주세요." }, { status: 400 });
  const [previous] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!previous) return json(request, { error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (["won", "completed"].includes(previous.status) && status === "closed") return json(request, { error: "계약·완료 건은 미계약 종료로 변경할 수 없습니다." }, { status: 400 });
  const now = new Date();
  const closedAt = status === "closed" ? previous.closedAt || now.toISOString().slice(0, 19).replace("T", " ") : null;
  const deleteAfter = status === "closed" ? previous.deleteAfter || retentionDeadline(now) : null;
  await getDb().update(leads).set({ status, closedAt, deleteAfter }).where(eq(leads.id, id));
  return json(request, { ok: true });
  } catch { return json(request, { error: "상태를 변경하지 못했습니다. 다시 시도해주세요." }, { status: 503 }); }
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
