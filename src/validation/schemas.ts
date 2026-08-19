import { ValidationChain, body, query } from 'express-validator';
import { PropertyType } from '../models';

const propertyTypes = Object.values(PropertyType);

export const credentialsValidators: ValidationChain[] = [
  body('username').isString().trim().isLength({ min: 3, max: 100 }),
  body('password').isString().isLength({ min: 8, max: 200 }),
];

export const propertyValidators: ValidationChain[] = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').isString().trim().notEmpty(),
  body('location').isString().trim().isLength({ min: 1, max: 200 }),
  body('price').isFloat({ gt: 0 }).toFloat(),
  body('type').isIn(propertyTypes),
  body('bedrooms').optional().isInt({ min: 0 }).toInt(),
  body('bathrooms').optional().isInt({ min: 0 }).toInt(),
  body('squareFeet').isInt({ gt: 0 }).toInt(),
  body('amenities').optional().isArray(),
  body('amenities.*').optional().isString().trim().notEmpty(),
];

export const updatePropertyValidators: ValidationChain[] = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().trim().notEmpty(),
  body('location').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('price').optional().isFloat({ gt: 0 }).toFloat(),
  body('type').optional().isIn(propertyTypes),
  body('bedrooms').optional().isInt({ min: 0 }).toInt(),
  body('bathrooms').optional().isInt({ min: 0 }).toInt(),
  body('squareFeet').optional().isInt({ gt: 0 }).toInt(),
  body('amenities').optional().isArray(),
  body('amenities.*').optional().isString().trim().notEmpty(),
  body().custom((_value, { req }) => {
    if (Object.keys(req.body).length === 0) throw new Error('At least one property field is required');
    return true;
  }),
];

export const propertyFilterValidators: ValidationChain[] = [
  query('location').optional().isString().trim(),
  query('type').optional().isIn(propertyTypes),
  query(['minPrice', 'maxPrice']).optional().isFloat({ min: 0 }).toFloat(),
  query(['minBedrooms', 'maxBedrooms']).optional().isInt({ min: 0 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('minPrice').optional().custom((value, { req }) => {
    const maxPrice = req.query?.maxPrice;
    return maxPrice === undefined || Number(value) <= Number(maxPrice);
  }).withMessage('minPrice must be less than or equal to maxPrice'),
  query('minBedrooms').optional().custom((value, { req }) => {
    const maxBedrooms = req.query?.maxBedrooms;
    return maxBedrooms === undefined || Number(value) <= Number(maxBedrooms);
  }).withMessage('minBedrooms must be less than or equal to maxBedrooms'),
];
