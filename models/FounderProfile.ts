import { Schema, model, models, Document, Types } from 'mongoose';

export interface IFounderProfile extends Document {
  userId: Types.ObjectId;
  brandName?: string;
  aboutFounder: string;
  storyHighlights: string[];
  nicheCategoryId: Types.ObjectId;
  region?: string;
  stats: {
    storyCount: number;
    followersCount: number;
    profileViews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const founderProfileSchema = new Schema<IFounderProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    aboutFounder: {
      type: String,
      required: true,
      trim: true,
    },
    storyHighlights: {
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
    stats: {
      storyCount: {
        type: Number,
        default: 0,
      },
      followersCount: {
        type: Number,
        default: 0,
      },
      profileViews: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FounderProfile =
  models.FounderProfile || model<IFounderProfile>('FounderProfile', founderProfileSchema);

export default FounderProfile;
