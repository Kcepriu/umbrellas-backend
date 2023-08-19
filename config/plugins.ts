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
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        // baseUrl: env("CDN_URL"),
        // rootPath: env("CDN_ROOT_PATH"),
        s3Options: {
          accessKeyId: env("AWS_ACCESS_KEY_ID"),
          secretAccessKey: env("AWS_ACCESS_SECRET"),
          region: env("AWS_REGION"),
          // endpoint: env("SCALEWAY_ENDPOINT"),
          params: {
            ACL: "public-read", // <== set ACL to private
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: env("AWS_BUCKET"),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
