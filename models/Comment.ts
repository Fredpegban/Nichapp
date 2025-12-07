import { Schema, model, models, Document, Types } from 'mongoose';

export interface IComment extends Document {
  storyId: Types.ObjectId;
  authorId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Comment = models.Comment || model<IComment>('Comment', commentSchema);

export default Comment;
