const { validationResult, body } = require('express-validator');

// Validation middleware for creating a story
const validateStory = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('condition')
    .notEmpty()
    .withMessage('Condition is required')
    .isIn([
      'Anxiety',
      'Depression',
      'Burnout',
      'Stress',
      'Sleep Issues',
      'PTSD',
      'OCD',
      'Panic Disorder',
      'Other',
    ])
    .withMessage('Invalid condition type'),
  body('story')
    .trim()
    .notEmpty()
    .withMessage('Story is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Story must be between 10 and 5000 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

// Validation middleware for creating a comment
const validateComment = [
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 2, max: 1000 })
    .withMessage('Comment must be between 2 and 1000 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be a boolean'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateStory,
  validateComment,
  handleValidationErrors,
};
