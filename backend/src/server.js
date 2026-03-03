import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { Citizen, Record, Report, Evidence, Investigation, Officer } from './models.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const OFFICER_ROLE_ID = process.env.OFFICER_ROLE_ID || '1474417640003993691';

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const admin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  next();
};

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/login', async (req, res) => {
  const { matricule, password } = req.body;
  const officer = await Officer.findOne({ matricule });
  if (!officer || !(await bcrypt.compare(password, officer.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  officer.lastLogin = new Date();
  await officer.save();
  const token = jwt.sign({ id: officer._id, matricule: officer.matricule, grade: officer.grade, isAdmin: officer.isAdmin }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.get('/api/auth/discord/url', (_, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
    scope: 'identify guilds guilds.members.read',
  });
  res.json({ url: `https://discord.com/oauth2/authorize?${params}` });
});

app.get('/api/me', auth, async (req, res) => {
  const officer = await Officer.findById(req.user.id).select('-passwordHash');
  res.json(officer);
});

app.get('/api/citizens', auth, async (req, res) => {
  const q = req.query.q;
  const query = q ? { fullname: { $regex: q, $options: 'i' } } : {};
  res.json(await Citizen.find(query).sort({ createdAt: -1 }));
});

app.post('/api/citizens', auth, async (req, res) => {
  res.status(201).json(await Citizen.create(req.body));
});

app.get('/api/records', auth, async (_, res) => {
  res.json(await Record.find().populate('citizenId').sort({ updatedAt: -1 }));
});

app.post('/api/casiers', auth, async (req, res) => {
  const { citizen, offense } = req.body;
  let target = await Citizen.findOne({ discordId: citizen.discordId || '__none__' });
  if (!target) target = await Citizen.create(citizen);

  let record = await Record.findOne({ citizenId: target._id });
  if (!record) record = await Record.create({ citizenId: target._id, offenses: [] });

  record.offenses.push({ ...offense, officer: req.user.matricule });
  await record.save();
  res.status(201).json(await record.populate('citizenId'));
});

app.get('/api/reports', auth, async (_, res) => {
  res.json(await Report.find().sort({ createdAt: -1 }));
});

app.post('/api/reports', auth, async (req, res) => {
  const data = { ...req.body, officerId: req.user.id, officer: req.user.matricule, interventions: (req.body.interventions || []).slice(0, 7) };
  res.status(201).json(await Report.create(data));
});

app.post('/api/evidence/upload', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image required' });
  const item = await Evidence.create({
    filePath: `/uploads/${req.file.filename}`,
    uploadedBy: req.user.matricule,
    linkedTo: req.body.linkedTo,
  });
  res.status(201).json(item);
});

app.get('/api/enquetes', auth, async (_, res) => {
  res.json(await Investigation.find().sort({ createdAt: -1 }));
});

app.post('/api/enquetes', auth, async (req, res) => {
  res.status(201).json(await Investigation.create(req.body));
});

app.post('/api/admin/create-officer', auth, admin, async (req, res) => {
  const { matricule, password, grade, discordId, isAdmin } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const officer = await Officer.create({ matricule, passwordHash, grade, discordId, isAdmin });
  res.status(201).json({ id: officer._id, matricule: officer.matricule });
});

async function bootstrap() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lapd-mdt');

  if (!(await Officer.findOne({ matricule: 'LAPD-001' }))) {
    await Officer.create({
      matricule: 'LAPD-001',
      passwordHash: await bcrypt.hash('changeme123', 10),
      grade: 'Captain',
      isAdmin: true,
    });
  }

  app.listen(PORT, () => console.log(`API listening on ${PORT}. Officer role required: ${OFFICER_ROLE_ID}`));
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
