module.exports = {
  apps: [
    {
      name: "pupwolfbot",
      script: "./dist/index.js",
      watch: ".",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
