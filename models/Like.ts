import { Schema, model, models, Document, Types } from 'mongoose';

export interface ILike extends Document {
  storyId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

likeSchema.index({ storyId: 1, userId: 1 }, { unique: true });

const Like = models.Like || model<ILike>('Like', likeSchema);

export default Like;
