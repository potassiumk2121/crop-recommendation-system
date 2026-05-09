import mongoose from 'mongoose';

/**
 * Stores each inference request + ML result with ISO timestamps for analytics.
 */
const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inputs: {
      N: { type: Number, required: true },
      P: { type: Number, required: true },
      K: { type: Number, required: true },
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      ph: { type: Number, required: true },
      rainfall: { type: Number, required: true },
    },
    predictedCrop: { type: String, required: true, index: true },
    confidence: { type: Number, default: null },
  },
  { timestamps: true }
);

predictionSchema.index({ createdAt: -1 });

export const Prediction = mongoose.model('Prediction', predictionSchema);
