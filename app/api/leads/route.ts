import { getDb } from "../../../db";
import { leads } from "../../../db/schema";

const allowedRegions = new Set(["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주", "기타 지역"]);
const allowedInquiryTypes = new Set(["에어컨 수리", "에어컨 설치", "에어컨 이전설치", "중고 에어컨 구매", "중고 에어컨 매입 문의", "가스 충전", "철거", "기타"]);
const allowedAirconTypes = new Set(["벽걸이", "스탠드", "2in1", "시스템", "업소용", "잘 모르겠음"]);

function cleanOptional(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const region = cleanOptional(body.region, 30);
    const inquiryType = cleanOptional(body.inquiryType, 40);
    const airconType = cleanOptional(body.airconType, 30);
    const phone = cleanOptional(body.phone, 20)?.replace(/\s/g, "") ?? null;

    if (!region || !allowedRegions.has(region) || !inquiryType || !allowedInquiryTypes.has(inquiryType) || !airconType || !allowedAirconTypes.has(airconType)) {
      return Response.json({ error: "신청 항목을 다시 확인해주세요." }, { status: 400 });
    }
    if (!phone || !/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)) {
      return Response.json({ error: "연락처를 정확히 입력해주세요." }, { status: 400 });
    }
    if (body.consent !== true) {
      return Response.json({ error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
    }

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

    return Response.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("lead submission failed", error);
    return Response.json({ error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
