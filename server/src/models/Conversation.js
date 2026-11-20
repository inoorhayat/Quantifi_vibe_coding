import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tone: { type: String, enum: ['professional', 'casual', 'concise'], default: 'professional' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New chat', trim: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true } // createdAt and updatedAt
);

conversationSchema.index({ updatedAt: -1 }); // fast history sidebar queries

export default mongoose.model('Conversation', conversationSchema);