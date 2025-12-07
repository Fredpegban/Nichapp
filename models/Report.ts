import { Schema, model, models, Document, Types } from 'mongoose';

export type ReportStatus = 'open' | 'reviewed' | 'resolved';
export type ReportTargetType = 'story' | 'user';

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['story', 'user'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'resolved'],
      default: 'open',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Report = models.Report || model<IReport>('Report', reportSchema);

export default Report;
