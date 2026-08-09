import { env } from "cloudflare:workers";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";

const allowedRegions = new Set(["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주", "기타 지역"]);
const allowedInquiryTypes = new Set(["에어컨 수리", "에어컨 설치", "에어컨 이전설치", "중고 에어컨 구매", "중고 에어컨 매입 문의", "가스 충전", "철거", "기타"]);
const allowedAirconTypes = new Set(["벽걸이", "스탠드", "2in1", "시스템", "업소용", "잘 모르겠음"]);
const allowedStatuses = new Set(["new", "contacted", "quoting", "won", "completed", "hold"]);
const allowedOrigins = new Set(["https://bbinge.github.io", "http://localhost:3000"]);

function corsHeaders(request: Request) {
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
  return Response.json(data, { ...init, headers: { ...corsHeaders(request), ...(init.headers || {}) } });
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

export async function POST(request: Request) {
  try {
    if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
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

    const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    const duplicate = await getDb().select({ id: leads.id }).from(leads).where(and(eq(leads.phone, phone), eq(leads.inquiryType, inquiryType), gte(leads.createdAt, cutoff))).limit(1);
    if (duplicate.length) return json(request, { ok: true, id: duplicate[0].id, duplicate: true }, { status: 200 });

    const [lead] = await getDb().insert(leads).values({
      region,
      inquiryType,
      airconType,
      phone,
      sourceUrl: cleanOptional(body.sourceUrl),
      referrer: cleanOptional(body.referrer),
      utmSource: cleanOptional(body.utmSource, 120),
      utmMedium: cleanOptional(body.utmMedium, 120),
      utmCampaign: cleanOptional(body.utmCampaign, 120),
      utmContent: cleanOptional(body.utmContent, 120),
      utmTerm: cleanOptional(body.utmTerm, 120),
    }).returning({ id: leads.id });

    return json(request, { ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("lead submission failed", error);
    return json(request, { error: "접수 중 문제가 발생했습니다. 전화 상담 010-9183-2200으로 연락해주세요." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
  if (!isAdmin(request)) return json(request, { error: "관리자 인증이 필요합니다." }, { status: 401 });
  const rows = await getDb().select().from(leads).orderBy(desc(leads.id)).limit(500);
  return json(request, { ok: true, leads: rows });
}

export async function PATCH(request: Request) {
  if (!isAllowedRequest(request)) return json(request, { error: "허용되지 않은 접속 경로입니다." }, { status: 403 });
  if (!isAdmin(request)) return json(request, { error: "관리자 인증이 필요합니다." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  const status = cleanOptional(body.status, 20);
  if (!Number.isInteger(id) || id < 1 || !status || !allowedStatuses.has(status)) return json(request, { error: "변경할 상태를 확인해주세요." }, { status: 400 });
  await getDb().update(leads).set({ status }).where(eq(leads.id, id));
  return json(request, { ok: true });
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
