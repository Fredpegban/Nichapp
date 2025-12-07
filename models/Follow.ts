import { Schema, model, models, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: 'FounderProfile',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = models.Follow || model<IFollow>('Follow', followSchema);

export default Follow;
