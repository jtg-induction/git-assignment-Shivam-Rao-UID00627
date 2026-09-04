const userService = require('../services/userService');

const register = async (req, res, next) => {
  try {
    // console.log('[DEBUG] register() called with body:', JSON.stringify(req.body)); // DEBUG
    // console.log('[DEBUG] Headers received:', JSON.stringify(req.headers));         // DEBUG
    const user = await userService.registerUser(req.body);
    // console.log('[DEBUG] registerUser() returned:', JSON.stringify(user));         // DEBUG
    res.status(201).json({ success: true, message: 'Account created successfully.', data: user });
  } catch (err) {
    // console.log('[DEBUG] register() threw error:', err.message, err.stack);       // DEBUG
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    // console.log('[DEBUG] login() called. Email:', req.body.email);                // DEBUG
    // console.log('[DEBUG] Raw password received (length):', req.body.password?.length); // DEBUG - SECURITY RISK!
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    const result = await userService.loginUser(email, password);
    // console.log('[DEBUG] loginUser() result token:', result.token);               // DEBUG - LEAKS TOKEN IN LOGS!
    // console.log('[DEBUG] loginUser() user object:', JSON.stringify(result.user)); // DEBUG
    res.json({ success: true, message: 'Login successful.', data: result });
  } catch (err) {
    // console.log('[DEBUG] login() error:', err);                                   // DEBUG
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    // console.log('[DEBUG] getMe() - req.user from auth middleware:', JSON.stringify(req.user)); // DEBUG
    const user = await userService.getUserById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    // console.log('[DEBUG] getAllUsers() called by user:', req.user?.id);            // DEBUG
    const users = await userService.getAllUsers();
    // console.log('[DEBUG] getAllUsers() found', users.length, 'users');             // DEBUG
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id);
    res.json({ success: true, message: 'User account deactivated.', data: user });
  } catch (err) { next(err); }
};

// ---- Profile endpoints (added by feature/dependent-feature) ----

/**
 * GET /api/users/me/profile
 * Get the detailed profile of the currently authenticated user.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json({
      success: true,
      data: {
        ...user,
        memberSince: user.createdAt,
        accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days',
      },
    });
  } catch (err) { next(err); }
};

/**
 * PUT /api/users/me/profile
 * Update the authenticated user's profile (name, defaultAddress).
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'defaultAddress'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update. Allowed: name, defaultAddress.' });
    }

    const user = await userService.updateUserProfile(req.user.id, updates);
    res.json({ success: true, message: 'Profile updated successfully.', data: user });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/users/me
 * Self-service account deletion. Requires password confirmation in body.
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password confirmation is required.' });
    await userService.deleteUserAccount(req.user.id, password);
    res.json({ success: true, message: 'Your account has been permanently deleted.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, getAllUsers, deactivateUser, getProfile, updateProfile, deleteAccount };
