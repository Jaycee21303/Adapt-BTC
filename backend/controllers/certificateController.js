const certificateService = require('../services/certificateService');
const validateRequest = require('../middleware/validation');
const { certificateSchema } = require('../utils/validators');

const generateCertificate = [validateRequest(certificateSchema), async (req, res, next) => {
  try {
    const { courseId } = req.validated;
    const result = await certificateService.generateForUser({ userId: req.user.id, courseId });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}];

module.exports = { generateCertificate };
