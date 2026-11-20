/**
 * TypeScript / JSDoc Type definitions for the Public Product domain.
 *
 * @typedef {Object} ProductVariant
 * @property {number} id
 * @property {number} size
 * @property {string} display
 * @property {number} regular
 * @property {number} founding
 * @property {number} outright
 * @property {string} currency
 * @property {string|null} [tag]
 *
 * @typedef {Object} ProductImage
 * @property {string} src
 * @property {string} [alt]
 * @property {string} [pos]
 * @property {boolean} [is_primary]
 *
 * @typedef {Object} PublicProduct
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} sku
 * @property {string} [model_number]
 * @property {string} summary
 * @property {string} short_description
 * @property {string[]} ideal_for
 * @property {string[]} useCases
 * @property {string} [format]
 * @property {string|null} [badge]
 * @property {string} category
 * @property {string|null} [category_name]
 * @property {number|null} price
 * @property {string} currency
 * @property {boolean} is_featured
 * @property {boolean} is_active
 * @property {number[]} sizes
 * @property {ProductImage[]} images
 * @property {ProductVariant[]} variants
 */

export const EMPTY_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: null,
  to: null,
};
