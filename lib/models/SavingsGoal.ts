import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISavingsGoal extends Document {
  userId: Types.ObjectId;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goalName: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

savingsGoalSchema.index({ userId: 1, status: 1 });

export default (mongoose.models.SavingsGoal as mongoose.Model<ISavingsGoal>) ||
  mongoose.model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);
