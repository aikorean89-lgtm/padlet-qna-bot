// 예약 실행: 설명에 #AI답변 이 들어간 내 패들렛을 모두 돌며 새 질문에 자동 답변
// - Vercel Cron(하루 1번) 또는 GitHub Actions(15분마다)가 호출
// - 관리 화면을 켜 두지 않아도 강의 후 늦게 올라온 질문까지 처리
import { timingSafeEqual } from 'node:crypto';
import { sendError, listMyBoards, processBoard, HttpError } from '../lib/core.js';

const RECENT_DAYS = Number(process.env.AUTO_RECENT_DAYS || 14);

function checkCron(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new HttpError(500, 'CRON_SECRET 환경변수가 설정되지 않았어요.');
  const got = Buffer.from(String(req.headers.authorization || ''));
  const want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) throw new HttpError(401, 'unauthorized');
}

export default async function handler(req, res) {
  try {
    checkCron(req);
    const deadline = Date.now() + 50_000;
    const since = Date.now() - RECENT_DAYS * 86400_000;
    const boards = (await listMyBoards()).filter(b => b.auto && (!b.updatedAt || Date.parse(b.updatedAt) >= since));

    const report = [];
    let budget = 12; // 한 번 실행에 최대 답변 수
    for (const b of boards) {
      if (Date.now() > deadline || budget <= 0) break;
      try {
        const r = await processBoard(b.id, {
          mode: 'auto',
          maxPerRun: budget,
          minAgeMs: 2 * 60_000, // 방금 올라온 글은 관리 화면이 처리하도록 2분 대기
          deadline,
        });
        const posted = r.results.filter(x => x.status === 'posted').length;
        budget -= r.results.length;
        report.push({ board: b.title, posted, pending: r.pending, errors: r.results.filter(x => x.status === 'error').map(x => x.error) });
      } catch (e) {
        report.push({ board: b.title, error: e.message });
        if (e.status === 429) break;
      }
    }
    res.status(200).json({ checked: boards.length, report });
  } catch (e) {
    sendError(res, e);
  }
}
