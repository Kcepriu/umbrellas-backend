/**
 * filter service
 */

import { factories } from "@strapi/strapi";
import { getAllFilters, IDescribeFilter } from "../helpers/filter";

export default factories.createCoreService(
  "api::filter.filter",
  ({ strapi }) => ({
    async findAllFilters(query) {
      const { categories } = query;
      console.log("🚀 ~ categories:", categories);

      const listFilters = await strapi.db
        .query("api::filter.filter")
        .findMany(query);

      //categories.slug
      const filterCondition = {
        fieldName: "categories",
        operation: "=",
        value: categories,
      };

      const result = await getAllFilters(
        strapi,
        listFilters as unknown as IDescribeFilter[],
        filterCondition
      );

      //Отримали список фільтрів. Для кожного отримати Значення і повернути
      return result;
    },
  })
);

// // ! ---------------------------------
//       // fieldName: "categories.slug",
//       const filterСategoriy = {
//         fieldName: "categories.slug",
//         operation: "=",
//         value: "cholovichi",
//       };

//       const mres = await getAllValueForFilter({
//         strapi,
//         uid: "api::product.product",
//         selectFieldName: "propertys.model.*",
//         filter: filterСategoriy,
//       });
//       console.log("🚀 ~ mres:", mres);
//       // selectFieldName: "propertys.length",
//       // selectFieldName: "propertys.model.*",
//       // selectFieldName: "price",
//       // ! ---------------------------------
