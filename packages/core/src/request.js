import "isomorphic-fetch";

export default ({ url, ...options }, cb) => {
  fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.arrayBuffer().catch((error) => {
          throw new Error(
            `Response is not a buffer for url ${url}. Error: ${error.message}`
          );
        });
      }

      throw new Error(`HTTP Status ${response.status} for url ${url}`);
    })
    .then((data) => cb(null, data))
    .catch((error) => cb(error));
};
