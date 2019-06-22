function supported() {
  return /\{\s+\[native code\]/.test(
    Function.prototype.toString.call(window.fetch)
  );
}

function get(url, options, cb) {
  if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
    return cb(new Error('fetchURLHandler: Cannot go from HTTPS to HTTP.'));
  }

  let request = fetch(url, {
    mode: 'cors',
    headers: new Headers({ 'content-type': 'text/xml' }),
    credentials: options.withCredentials ? 'include' : 'omit',
    redirect: options.followRedirects ? 'follow' : 'error'
  });

  if (options.timeout) {
    request = Promise.race([
      request,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('fetchURLHandler: timeout')),
          options.timeout
        )
      )
    ]);
  }

  request
    .then(response => response.text())
    .then(str =>
      cb(null, new window.DOMParser().parseFromString(str, 'text/xml'))
    )
    .catch(err => cb(err));
}

export const fetchURLHandler = {
  get,
  supported
};
