// 승인 모드: 강사가 확인·수정한 답변을 댓글로 게시
import { checkAdmin, sendError, postComment, toCommentHtml, readBody, HttpError } from '../lib/core.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'POST만 가능해요.');
    checkAdmin(req);
    const { postId, answer } = readBody(req);
    if (!postId || !String(answer || '').trim()) throw new HttpError(400, '게시물 ID와 답변 내용이 필요해요.');
    const html = toCommentHtml(String(answer).slice(0, 4000));
    await postComment(String(postId), html);
    res.status(200).json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
}
