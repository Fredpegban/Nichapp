import { Schema, model, models, Document } from 'mongoose';

export interface INiche extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const nicheSchema = new Schema<INiche>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Niche = models.Niche || model<INiche>('Niche', nicheSchema);

export default Niche;
