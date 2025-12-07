import { Schema, model, models, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  userId?: Types.ObjectId;
  type: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

const Event = models.Event || model<IEvent>('Event', eventSchema);

export default Event;
