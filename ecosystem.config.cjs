module.exports = {
    apps : [
      {
        name: 'multi-tenancy-be',
        script: './dist/app.js',
        env: {
          NODE_ENV: 'production'
        }
      }
    ],
  };
