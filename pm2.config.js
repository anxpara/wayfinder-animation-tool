module.exports = {
  apps: [
    {
      name: "wayfinder-watcher",
      script: "npm run prepublish",
      watch: ["src"],
      autorestart: false,
    },
  ],
};
