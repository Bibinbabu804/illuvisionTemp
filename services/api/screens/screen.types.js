/**
 * TypeScript / JSDoc Type definitions for the Public Screens (Advertising Inventory) domain.
 *
 * @typedef {Object} ScreenSpecs
 * @property {number|null} [display_size_inches]
 * @property {string|null} [resolution]
 * @property {string|null} [aspect_ratio]
 * @property {string|null} [display_technology]
 * @property {number|null} [brightness_nits]
 * @property {number|null} [pixel_pitch_mm]
 * @property {string|null} [orientation]
 * @property {string|null} [operating_hours]
 *
 * @typedef {Object} PublicScreen
 * @property {number} id
 * @property {string} name
 * @property {string} screen_code
 * @property {string} slug
 * @property {string|null} description
 * @property {string} asset_type
 * @property {string} asset_type_label
 * @property {string|null} screen_type
 * @property {Object|null} screen_category
 * @property {string} location_name
 * @property {string|null} placement_environment
 * @property {Object|null} city
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {ScreenSpecs} specifications
 * @property {Object|null} price
 * @property {string|null} thumbnail
 * @property {string} status
 * @property {string} booking_status
 * @property {boolean} is_bookable
 */

export const EMPTY_SCREEN_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};
