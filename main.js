new (require('./tsbot'))().start().then((ts) => ts.registerPlugins('./plugins/core', './plugins/dummy')).catch(console.error);
