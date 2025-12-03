const userService = require('../services/userService');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const progress = await userService.getProgress(req.user.id);
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

const getCertificates = async (req, res, next) => {
  try {
    const certificates = await userService.getCertificates(req.user.id);
    res.json({ success: true, data: certificates });
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const activity = await userService.getActivity(req.user.id);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, getProgress, getCertificates, getActivity };
