/**
 * filter controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::filter.filter",
  ({ strapi }) => ({
    async findAllFilters(ctx) {
      try {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);
        const results = await strapi
          .service("api::filter.filter")
          .findAllFilters(sanitizedQueryParams);

        const sanitizedResults = await this.sanitizeOutput(results, ctx);

        return this.transformResponse(sanitizedResults, {});
      } catch (err) {
        ctx.throw(500, err.message);
      }
    },
  })
);
