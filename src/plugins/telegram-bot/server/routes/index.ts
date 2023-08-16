export default [
  {
    method: "GET",
    path: "/",
    handler: "telegramController.find",
    config: {
      policies: [],
      auth: false,
    },
  },

  {
    method: "GET",
    path: "/:chatId",
    handler: "telegramController.findByChatId",
    config: {
      policies: [],
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/",
    handler: "telegramController.create",
    config: {
      policies: [],
      auth: false,
    },
  },

  {
    method: "DELETE",
    path: "/:id",
    handler: "telegramController.delete",
    config: {
      policies: [],
      auth: false,
    },
  },

  {
    method: "PUT",
    path: "/:id",
    handler: "telegramController.update",
    config: {
      policies: [],
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/send-message",
    handler: "telegramController.sendMessageToAdmins",
    config: {
      policies: [],
      auth: false,
    },
  },
];
