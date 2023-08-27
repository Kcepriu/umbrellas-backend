import { Strapi } from "@strapi/strapi";

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

export interface IDescribeFilter {
  id: number;
  title: string;
  exampleSearchParam: string;
  fieldName: string;
  uidTable: string;
}

export async function getAllFilters(
  strapi: Strapi,
  listFilter: IDescribeFilter[],
  filterCondition: IFilter
) {
  const result = await Promise.all(
    listFilter.map(async (filter) => {
      const param = {
        strapi,
        uid: filter.uidTable,
        selectFieldName: filter.fieldName,
        filter: filterCondition,
      };

      try {
        const dataFilter = await getAllValueForFilter(param);
        return {
          ...filter,
          data: dataFilter,
        };
      } catch {
        return {
          ...filter,
          data: [],
        };
      }
    })
  );

  return result;
}

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
export async function getAllValueForFilter(param: IParam) {
  //* Add Select and From
  const from = addSelectFrom({ ...param }, 1);
  // * add JOIN and WHERE
  const allQuery = addSectionWhere({ ...param }, from, 1);

  const result = await allQuery.then();

  return result;
}

function addSelectFromSingle(
  strapi: Strapi,
  tableName: string,
  fieldName: string,
  aliasName: string
) {
  const queryBuilder = addDistinct(
    strapi.db.connection,
    `${aliasName}.${fieldName}`
  );

  return addFrom(queryBuilder, `${tableName} as ${aliasName}`);
}

function addJoinToSelectFrom(
  queryBuilder,
  atributesSelectField,
  tableName: string,
  numTable: number
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

  //No filter
  if (!value) return queryBuilder;

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
