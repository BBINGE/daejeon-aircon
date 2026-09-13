import { env } from "cloudflare:workers";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { retentionDeadline } from "../../../db/retention";

const allowedRegions = new Set(["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주", "기타 지역"]);
// Legacy values remain valid during the frontend rollout.
const allowedInquiryTypes = new Set(["에어컨 수리", "에어컨 설치", "에어컨 이전설치", "중고 에어컨 구매", "중고 에어컨 매입 문의", "가스 충전", "철거", "기타", "이전설치", "신규 설치", "중고 매입 문의", "중고 구매"]);
const allowedAirconTypes = new Set(["벽걸이", "스탠드", "2in1", "시스템", "업소용", "냉난방기", "잘 모르겠음"]);
const allowedStatuses = new Set(["new", "contacted", "quoting", "won", "completed", "hold", "closed"]);
const allowedOrigins = new Set(["https://bbinge.github.io", "https://kimdaegon-aircon.bbinge95.chatgpt.site", "http://localhost:3000"]);

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

function cleanUrl(value: unknown, originOnly = false) {
  try {
    const url = new URL(typeof value === "string" ? value : "");
    return /^(https?:)$/.test(url.protocol) ? (url.origin + (originOnly ? "" : url.pathname)).slice(0, 500) : null;
  } catch { return null; }
}

async function purgeExpired() {
  // Only explicitly closed, non-contract enquiries receive a deadline.
  await getDb().delete(leads).where(and(eq(leads.status, "closed"), lte(leads.deleteAfter, new Date().toISOString().slice(0, 19).replace("T", " "))));
}

export async function POST(request: Request) {
  try {
    if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
    if (Number(request.headers.get("content-length")) > 8192) return json(request, { error: "요청이 너무 큽니다." }, { status: 413 });
    const body = await request.json() as Record<string, unknown>;
    if (cleanOptional(body.companyWebsite, 100)) return json(request, { ok: true }, { status: 201 });
    const region = cleanOptional(body.region, 30);
    const inquiryType = cleanOptional(body.inquiryType, 40);
    const airconType = cleanOptional(body.airconType, 30);
    const phone = cleanOptional(body.phone, 20)?.replace(/\s/g, "") ?? null;

    if (!region || !allowedRegions.has(region) || !inquiryType || !allowedInquiryTypes.has(inquiryType) || !airconType || !allowedAirconTypes.has(airconType)) {
      return json(request, { error: "신청 항목을 다시 확인해주세요." }, { status: 400 });
    }
    if (!phone || !/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)) {
      return json(request, { error: "연락처를 정확히 입력해주세요." }, { status: 400 });
    }
    if (body.consent !== true) {
      return json(request, { error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
    }

    await purgeExpired();
    const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    const duplicate = await getDb().select({ id: leads.id }).from(leads).where(and(eq(leads.phone, phone), eq(leads.inquiryType, inquiryType), gte(leads.createdAt, cutoff))).limit(1);
    if (duplicate.length) return json(request, { ok: true, id: duplicate[0].id, duplicate: true }, { status: 200 });

    const [lead] = await getDb().insert(leads).values({
      region,
      inquiryType,
      airconType,
      phone,
      sourceUrl: cleanUrl(body.sourceUrl),
      referrer: cleanUrl(body.referrer, true),
      consentVersion: body.consentVersion === "2026-09-13" ? "2026-09-13" : "legacy",
      consentAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      utmSource: cleanOptional(body.utmSource, 120),
      utmMedium: cleanOptional(body.utmMedium, 120),
      utmCampaign: cleanOptional(body.utmCampaign, 120),
      utmContent: cleanOptional(body.utmContent, 120),
      utmTerm: cleanOptional(body.utmTerm, 120),
    }).returning({ id: leads.id });

    return json(request, { ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("lead submission failed", error instanceof Error ? error.name : "UnknownError");
    return json(request, { error: "접수 중 문제가 발생했습니다. 전화 상담 010-9183-2200으로 연락해주세요." }, { status: 500 });
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
