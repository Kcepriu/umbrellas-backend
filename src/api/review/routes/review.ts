/**
 * review router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::review.review", {
  config: {
    find: {},
    findOne: {},
    create: {},
    update: {
      middlewares: [
        {
          name: "global::is-owner ",
          config: { uid: "api::review.review" },
        },
      ],
    },
    delete: {
      middlewares: [
        {
          name: "global::is-owner ",
          config: { uid: "api::review.review" },
        },
      ],
    },
  },
});
