module.exports = {
  apps: [
    {
      name: "trialgrounds",
      script: "npm run start",
      watch: ["src/index.ts"],
    },
    {
      name: "trialgrounds-watcher",
      script: "npm run publish",
      watch: ["src", "node_modules/wayfinder-animation-tool/dist/cjs"],
      ignore_watch: ["src/index.ts"],
      autorestart: false,
    },
  ],
};
