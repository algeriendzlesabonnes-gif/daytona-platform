import mongoose from 'mongoose';

const citizenSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    discordId: String,
    username: String,
    photo: String,
    notes: String,
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const recordSchema = new mongoose.Schema(
  {
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
    offenses: [
      {
        title: String,
        description: String,
        officer: String,
        date: { type: Date, default: Date.now },
        evidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
      },
    ],
  },
  { timestamps: true },
);

const reportSchema = new mongoose.Schema(
  {
    officerId: String,
    officer: String,
    badgeNumber: String,
    unit: String,
    date: String,
    startTime: String,
    endTime: String,
    sector: String,
    summary: String,
    interventions: [
      {
        time: String,
        place: String,
        type: String,
        persons: String,
        description: String,
        result: String,
      },
    ],
    finesCount: Number,
    arrestsCount: Number,
    seizedItems: String,
  },
  { timestamps: true },
);

const evidenceSchema = new mongoose.Schema(
  {
    filePath: String,
    uploadedBy: String,
    linkedTo: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const investigationSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    officersInCharge: [String],
    evidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
    status: { type: String, default: 'Open' },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const officerSchema = new mongoose.Schema(
  {
    matricule: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    grade: { type: String, default: 'Officer' },
    discordId: String,
    username: String,
    avatar: String,
    isAdmin: { type: Boolean, default: false },
    lastLogin: Date,
  },
  { timestamps: true },
);

export const Citizen = mongoose.model('Citizen', citizenSchema);
export const Record = mongoose.model('Record', recordSchema);
export const Report = mongoose.model('Report', reportSchema);
export const Evidence = mongoose.model('Evidence', evidenceSchema);
export const Investigation = mongoose.model('Investigation', investigationSchema);
export const Officer = mongoose.model('Officer', officerSchema);
