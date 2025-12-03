const authService = require('../services/authService');
const validateRequest = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../utils/validators');

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = [validateRequest(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.validated);
    const { token, user: safeUser } = await authService.loginUser({ email: user.email, password: req.validated.password });
    setAuthCookie(res, token);
    res.status(201).json({ success: true, user: safeUser, token });
  } catch (err) {
    next(err);
  }
}];

const login = [validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.validated);
    setAuthCookie(res, token);
    res.json({ success: true, user, token });
  } catch (err) {
    next(err);
  }
}];

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, logout };
