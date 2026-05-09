import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

/** POST /api/auth/register */
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hash });
  const token = signToken(user._id.toString());

  return res.status(201).json({
    success: true,
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
}

/** POST /api/auth/login */
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = signToken(user._id.toString());
  return res.json({
    success: true,
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
}

/** GET /api/auth/me */
export async function me(req, res) {
  return res.json({ success: true, user: req.user });
}
