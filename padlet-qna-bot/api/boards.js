// 내 패들렛 목록 (관리 화면 선택 상자용)
import { checkAdmin, sendError, listMyBoards, AUTO_TAG } from '../lib/core.js';

export default async function handler(req, res) {
  try {
    checkAdmin(req);
    const boards = await listMyBoards();
    res.status(200).json({ boards: boards.slice(0, 60), autoTag: AUTO_TAG });
  } catch (e) {
    sendError(res, e);
  }
}
