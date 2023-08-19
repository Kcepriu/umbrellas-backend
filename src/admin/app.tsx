export default {
  config: {
    locales: ["en"],
    tutorials: false,
    notifications: {
      releases: false,
    },
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Dashboard",
        "Auth.form.welcome.title": "Welcome to Umbrellas!",
        "Auth.form.welcome.subtitle": "Log in admin account",
      },
    },
  },
  bootstrap(app) {
    console.log(app);
  },
};
