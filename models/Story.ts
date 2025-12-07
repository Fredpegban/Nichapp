import { Schema, model, models, Document, Types } from 'mongoose';

export type StoryStatus = 'published' | 'flagged' | 'removed';

export interface IStory extends Document {
  authorId: Types.ObjectId;
  founderProfileId: Types.ObjectId;
  text: string;
  mediaUrls: string[];
  nicheCategoryId: Types.ObjectId;
  region?: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  status: StoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    founderProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'FounderProfile',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    nicheCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Niche',
      required: true,
    },
    region: {
      type: String,
      trim: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'flagged', 'removed'],
      default: 'published',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Story = models.Story || model<IStory>('Story', storySchema);

export default Story;
