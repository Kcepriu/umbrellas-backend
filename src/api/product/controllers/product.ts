import { Strapi } from "@strapi/strapi";

/**
 * product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",

  ({ strapi }) => ({
    async find(ctx) {
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const filter = {};

      sanitizedQueryParams.filters = sanitizedQueryParams.filters
        ? {
            ...sanitizedQueryParams.filters,
            ...filter,
          }
        : filter;

      const { results, pagination } = await strapi
        .service("api::product.product")
        .find(sanitizedQueryParams);
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      // ! ---------------------------------
      await getAllValue(strapi, "api::product.product", "price");
      // ! ---------------------------------

      return this.transformResponse(sanitizedResults, { pagination });
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const filter = !isNaN(+id) ? { id: id } : { slug: id };

      sanitizedQueryParams.filters = sanitizedQueryParams.filters
        ? {
            ...sanitizedQueryParams.filters,
            ...filter,
          }
        : filter;

      const { results, pagination } = await strapi
        .service("api::product.product")
        .find(sanitizedQueryParams);

      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
  })
);

// uid: api::product.product
// fieldResult:
//    1. price
//    2. property.length
//    3. property.color.id property.color.*
//  filters:
//    1. {fieldName: "name",
//        operation: "like";
//        value: "%парасоль%",}
//    2. {fieldName: "caregory.slug",
//        operation: "=";
//        value: "dityachi",}

async function getAllValue(strapi: Strapi, uid: string, fieldName) {
  const filterСategoriy = {
    fieldName: "slug",
    value: "dityachi",
  };
  const { attributes, tableName } = strapi.db.metadata.get(uid);
  // console.log(attributes, tableName);
  console.log("tableName", tableName);
  console.log(attributes["categories"]);

  const type = attributes[fieldName].type;
  if (type === "relation") return [];
  // !
  // Якщо не relation, тоіз вказаної таблиці повертаємо це поле

  const selectStatement = addDistinct(strapi.db.connection, "p1.quantity")
    .from(`products as p1`)
    .join(`products_categories_links as pct`, `p1.id`, `pct.product_id`)
    .join(`categories as c`, `pct.category_id`, `c.id`)
    .where(`c.${filterСategoriy.fieldName}`, filterСategoriy.value);

  const result = await selectStatement.then();

  console.log("🚀 ~ selectStatement:", result);

  // return selectStatement;
  return [];
}

function addDistinct(queryBuilder, fieldName) {
  return queryBuilder.distinct(fieldName);
}

// const selectStatement = await strapi.db.connection
//   .distinct("m.*")
//   .from(`models as m`)
//   .join(
//     `components_product_product_properties_model_links as pc`,
//     `pc.model_id`,
//     `m.id`
//   )
//   .join(
//     `products_categories_links as pct`,
//     `pc.product_property_id`,
//     `pct.product_id`
//   )
//   .join(`categories as c`, `pct.category_id`, `c.id`);

// const selectStatement = await strapi.db.connection
//   .select("cppp.length")
//   .from(`components_product_product_properties as cppp`)
//   .join(`products_components as pc`, `pc.component_id`, `cppp.id`)
//   .join(`products_categories_links as pct`, `pc.entity_id`, `pct.product_id`)
//   .join(`categories as c`, `pct.category_id`, `c.id`)
//   .where(`pc.field`, "propertys")
//   .andWhere("pc.component_type", "product.product-property")
//   .groupBy("cppp.length");

// const selectStatement = await strapi.db.connection
//   .select("p1.quantity")
//   .from(`products as p1`)
//   .join(`products_categories_links as pct`, `p1.id`, `pct.product_id`)
//   .join(`categories as c`, `pct.category_id`, `c.id`)
//   .groupBy("p1.quantity");

// function () {
//         this.on(`pc.component_id`, "=", `cppp.id`).on(
//           "pc.field",
//           "=",
//           "propertys"
//         );
//       }

async function testDb(strapi: Strapi) {
  const { attributes, tableName } = strapi.db.metadata.get(
    "api::product.product"
  );
  //"api::product.product"
  // console.log("🚀 ~ attributes:", attributes);
  const joinTable = attributes["propertys"].joinTable;
  console.log("🚀 ~ joinTable:", joinTable);
  // const joinColumn = joinTable.joinColumn.name;
  // const invJoinColumn = joinTable.inverseJoinColumn.name;

  // const toStageId = "id";
  // const fromStageId = 1;

  // const selectStatement = await strapi.db.connection
  //   .select({ [joinColumn]: "t1.id", [invJoinColumn]: toStageId })
  //   .from(`${tableName} as t1`)
  //   .leftJoin(`${joinTable.name} as t2`, `t1.id`, `t2.${joinColumn}`)
  //   .where(`t2.${invJoinColumn}`, fromStageId);

  // const selectStatement = await strapi.db.connection
  //   .select({ [joinColumn]: "t1.id" })
  //   .from(`${tableName} as t1`)
  //   .leftJoin(`${joinTable.name} as t2`, `t1.id`, `t2.${joinColumn}`)
  //   .where(`t2.${invJoinColumn}`, fromStageId);

  // console.log("🚀 ~ selectStatement:", selectStatement);
}
