import { Strapi } from "@strapi/strapi";

/**
 * product controller
 */

import { factories } from "@strapi/strapi";
interface IFilter {
  fieldName: string;
  operation: string;
  value: string;
  arrayFieldName?: string[];
}
interface IParam {
  strapi: Strapi;
  uid: string;
  selectFieldName: string;
  filter: IFilter;
}

interface IJoinTable {
  name: string;
  joinColumn: {}[];
  inverseJoinColumn: {}[];
  pivotColumns: string[];
}
interface IAttributesField {
  type: string;
  columnName?: string;
  target?: string;
  joinTable?: IJoinTable;
}

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
      // fieldName: "categories.slug",
      const filterСategoriy = {
        fieldName: "categories.slug",
        operation: "=",
        value: "cholovichi",
      };

      const mres = await getAllValueForFilter({
        strapi,
        uid: "api::product.product",
        selectFieldName: "propertys.model.*",
        filter: filterСategoriy,
      });
      console.log("🚀 ~ mres:", mres);
      // selectFieldName: "propertys.length",
      // selectFieldName: "propertys.model.*",
      // selectFieldName: "price",
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
//    2. propertys.length
//    3. propertys.color.id property.color.*
//  filters:
//    1. {fieldName: "name",
//        operation: "like";
//        value: "%парасоль%",}
//    2. {fieldName: "categories.slug",
//        operation: "=";
//        value: "dityachi",}
async function getAllValueForFilter(param: IParam) {
  // const { strapi, uid, selectFieldName, filter } = param;
  // const { attributes, tableName } = strapi.db.metadata.get(uid);

  //* Add Select and From
  const from = addSelectFrom({ ...param }, 1);
  // * add JOIN and WHERE
  const allQuery = addSectionWhere({ ...param }, from, 1);

  const result = await allQuery.then();

  return result;
}

function addSelectFromSingle(strapi: Strapi, tableName, fieldName, aliasName) {
  const queryBuilder = addDistinct(
    strapi.db.connection,
    `${aliasName}.${fieldName}`
  );

  return addFrom(queryBuilder, `${tableName} as ${aliasName}`);
}

function addJoinToSelectFrom(
  queryBuilder,
  atributesSelectField,
  tableName,
  numTable
) {
  const joinTable = atributesSelectField.joinTable.name;
  let nameJoinColumn = atributesSelectField.joinTable.inverseJoinColumn.name;
  let nameReferencedJoinColumn =
    atributesSelectField.joinTable.inverseJoinColumn.referencedColumn;

  queryBuilder = addJoin(
    queryBuilder,
    `${joinTable} as t${numTable + 1}`,
    `t${numTable + 1}.${nameJoinColumn}`,
    `t${numTable + 2}.${nameReferencedJoinColumn}`
  );

  nameJoinColumn = atributesSelectField.joinTable.joinColumn.name;
  nameReferencedJoinColumn =
    atributesSelectField.joinTable.joinColumn.referencedColumn;

  queryBuilder = addJoin(
    queryBuilder,
    `${tableName} as t${numTable}`,
    `t${numTable}.${nameReferencedJoinColumn}`,
    `t${numTable + 1}.${nameJoinColumn}`
  );

  return queryBuilder;
}

function addSelectFromWithRelation(param: IParam, numTable: number) {
  const { strapi, uid, selectFieldName } = param;
  const arraySelectFieldName = selectFieldName.split(".");
  const { attributes, tableName } = strapi.db.metadata.get(uid);

  const atributesSelectField = attributes[arraySelectFieldName[0]];

  if (atributesSelectField.type !== "relation")
    throw new Error("Error create query from filter");

  const nextUid = atributesSelectField.target;
  const newSelectFieldName = arraySelectFieldName.slice(1).join(".");

  let queryBuilder = addSelectFrom(
    { ...param, uid: nextUid, selectFieldName: newSelectFieldName },
    numTable + 2
  );

  // JOIN

  return addJoinToSelectFrom(
    queryBuilder,
    atributesSelectField,
    tableName,
    numTable
  );
}

function addSelectFrom(param: IParam, numTable: number) {
  const { strapi, uid, selectFieldName } = param;
  const arraySelectFieldName = selectFieldName.split(".");
  const { tableName } = strapi.db.metadata.get(uid);

  if (arraySelectFieldName.length <= 1) {
    return addSelectFromSingle(
      strapi,
      tableName,
      arraySelectFieldName[0],
      `t${numTable}`
    );
  }

  return addSelectFromWithRelation(param, numTable);
}

function addJoinToAddSectionWhere(
  param: IParam,
  queryBuilder,
  numTable: number
) {
  const { strapi, filter } = param;
  const { fieldName } = filter;
  let { uid } = param;
  let arraySelectFieldName = fieldName.split(".");
  let inverseJoinColumn = { name: "", referencedColumn: "" };

  while (arraySelectFieldName.length > 0 || uid) {
    const whereField = arraySelectFieldName.shift();
    const { attributes, tableName } = strapi.db.metadata.get(uid);

    const atributesSelectField = attributes[whereField];
    console.log("🚀 ~ atributesSelectField:", atributesSelectField);
    uid = atributesSelectField.target;

    // first ralation
    if (numTable > 1) {
      queryBuilder = addJoin(
        queryBuilder,
        `${tableName} as tw${numTable}`,
        `tw${numTable}.${inverseJoinColumn.referencedColumn}`,
        `tw${numTable - 1}.${inverseJoinColumn.name}`
      );
      if (!atributesSelectField.joinTable) break;
      numTable++;
    }

    // second  ralation
    const joinTable = atributesSelectField.joinTable.name;
    const nameJoinColumn = atributesSelectField.joinTable.joinColumn.name;
    const nameReferencedJoinColumn =
      atributesSelectField.joinTable.joinColumn.referencedColumn;

    if (numTable === 1) {
      queryBuilder = addJoin(
        queryBuilder,
        `${joinTable} as tw${numTable}`,
        `tw${numTable}.${nameJoinColumn}`,
        `t${numTable}.${nameReferencedJoinColumn}`
      );
    } else {
      queryBuilder = addJoin(
        queryBuilder,
        `${joinTable} as tw${numTable}`,
        `tw${numTable}.${nameJoinColumn}`,
        `tw${numTable - 1}.${nameReferencedJoinColumn}`
      );
    }

    numTable++;
    inverseJoinColumn = atributesSelectField.joinTable.inverseJoinColumn;
  }
  return numTable;
}

function addSectionWhere(param: IParam, queryBuilder, numTable: number) {
  const { filter } = param;

  const { fieldName, operation, value } = filter;

  let arraySelectFieldName = fieldName.split(".");
  let whereField = arraySelectFieldName.at(-1);

  let aliasNameFieldWheree = "t";
  if (arraySelectFieldName.length > 1) {
    numTable = addJoinToAddSectionWhere(param, queryBuilder, numTable);

    aliasNameFieldWheree = "tw";
  }

  queryBuilder.where(
    `${aliasNameFieldWheree}${numTable}.${whereField}`,
    operation,
    value
  );

  return queryBuilder;
}

// * ------
function addDistinct(queryBuilder, fieldName) {
  return queryBuilder.distinct(fieldName);
}

function addFrom(queryBuilder, tableName) {
  return queryBuilder.from(tableName);
}

function addJoin(
  queryBuilder,
  tableName: string,
  fieldLeft: string,
  fieldRight: string
) {
  return queryBuilder.join(tableName, fieldLeft, fieldRight);
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
