export default ({ env }) => ({
  rest: {
    excludedFields: ["createdAt, updatedAt, publishedAt"],
    models: {
      products: {
        excludedFields: ["createdAt"],
      },
    },
  },
});
