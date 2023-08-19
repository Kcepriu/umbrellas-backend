export default ({ env }) => ({
  // "plugin-telegram-bot": {
  //   enabled: true,
  //   resolve: "./src/plugins/telegram-bot",
  // },

  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.example.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
          secure: true,
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: "umbrellas_shop@ukr.net",
        defaultReplyTo: "umbrellas_shop@ukr.net",
      },
    },
  },
});
