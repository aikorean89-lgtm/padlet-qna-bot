// 관리 화면에서 호출: 패들렛을 확인하고 새 질문에 답변(자동 게시 또는 초안)
import { checkAdmin, sendError, parseBoardId, processBoard, readBody, HttpError } from '../lib/core.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'POST만 가능해요.');
    checkAdmin(req);
    const b = readBody(req);
    const boardId = parseBoardId(b.board);
    const out = await processBoard(boardId, {
      mode: b.mode === 'preview' ? 'preview' : 'auto',
      memo: String(b.memo || '').slice(0, 6000),
      maxPerRun: Math.min(Math.max(Number(b.maxPerRun) || 3, 1), 5),
      includeOwnPosts: !!b.includeOwnPosts,
      skipIds: Array.isArray(b.skipIds) ? b.skipIds.slice(0, 500) : [],
      deadline: Date.now() + 45_000,
    });
    res.status(200).json(out);
  } catch (e) {
    sendError(res, e);
  }
}
