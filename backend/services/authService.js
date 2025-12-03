const { signToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const userModel = require('../models/userModel');

const registerUser = async ({ name, email, password }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }
  const passwordHash = await hashPassword(password);
  return userModel.createUser({ name, email, passwordHash });
};

const loginUser = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { registerUser, loginUser };
