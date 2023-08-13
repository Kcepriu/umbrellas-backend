/**
 * order service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::order.order"
  // ({ strapi }) => ({
  //   async create(params) {
  //     const result = await super.create(params);
  //     return result;
  //   },
  // })
);
