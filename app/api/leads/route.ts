import { env } from "cloudflare:workers";
import { and, desc, eq, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { retentionDeadline } from "../../../db/retention";

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

async function purgeExpired() {
  // Only explicitly closed, non-contract enquiries receive a deadline.
  await getDb().delete(leads).where(and(eq(leads.status, "closed"), lte(leads.deleteAfter, new Date().toISOString().slice(0, 19).replace("T", " "))));
}

export async function POST(request: Request) {
  return json(request, { error: "온라인 접수는 종료되었습니다. 010-9183-2200으로 전화 또는 문자 문의해주세요." }, { status: 410 });
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
