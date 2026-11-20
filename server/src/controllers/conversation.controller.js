import Conversation from '../models/Conversation.js';

export async function listConversations(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 30;

    const conversations = await Conversation.find()
      .select('title updatedAt')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const conversation = await Conversation.findById(req.params.id).lean();
    if (!conversation) return res.status(404).json({ message: 'Not found' });
    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}