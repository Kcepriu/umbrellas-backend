/**
 * filter controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::filter.filter",
  ({ strapi }) => ({
    async findAll(ctx) {
      const entries = await strapi.db.query("api::filter.filter").findMany({});

      ctx.body = entries;
    },
  })
);
