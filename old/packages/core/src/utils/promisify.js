const promisify = (fun, ctx, ...args) =>
  new Promise((resolve, reject) => {
    args.push((err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
    fun.bind(ctx)(...args);
  });

export default promisify;
