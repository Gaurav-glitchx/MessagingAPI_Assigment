import mongoose from 'mongoose';

export enum ContactStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

interface IContact extends mongoose.Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(ContactStatus), default: ContactStatus.PENDING }
}, { timestamps: true });

// Ensure unique combination of requester and recipient
contactSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
