/**
 * review controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::review.review",
  ({ strapi }) => ({
    async create(ctx) {
      const query = ctx.request.query;
      const data = ctx.request.body;
      const files = ctx.request.files;

      data.data.user = ctx.state.user.id;
      if (!data.data.date) data.data.date = Date.now();

      const results = await strapi
        .service("api::review.review")
        .create({ ...query, ...data, files });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, {});
    },
  })
);
