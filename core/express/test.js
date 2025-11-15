// @ts-check
/**
 * @typedef {200|400|401|403|500} HttpStatusCodeNumber
 */

/**
 * @typedef {Object} HTTPStatusCodes
 * @property {HttpStatusCodeNumber} HTTP_200_OK - HTTP 200 OK
 * @property {HttpStatusCodeNumber} HTTP_400_BAD_REQUEST - HTTP 400 Bad request
 * @property {HttpStatusCodeNumber} HTTP_401_UNAUTHORIZED - HTTP 401 Unauthorized
 * @property {HttpStatusCodeNumber} HTTP_403_FORBIDDEN - HTTP 403 Forbidden
 */

/**
 * Enum representing HTTP status codes.
 * @readonly
 * @enum {HttpStatusCodeNumber} HTTPStatusCode
 */
const HTTPStatusCode = {
  /** HTTP 200 OK */
  /** @type HttpStatusCodeNumber */
  HTTP_200_OK: 200,
  /** HTTP 400 Bad Request */
  /** @type HttpStatusCodeNumber */
  HTTP_400_BAD_REQUEST: 400,
  /** HTTP 401 Unauthorized */
  /** @type HttpStatusCodeNumber */
  HTTP_401_UNAUTHORIZED: 401,
  /** HTTP 403 Forbidden */
  /** @type HttpStatusCodeNumber */
  HTTP_403_FORBIDDEN: 403,
  /** HTTP 500 Server Error */
  /** @type HttpStatusCodeNumber */
  HTTP_500_SERVER_ERROR: 500,
};

/**
 *
 * @param {HTTPStatusCodes} a
 * @returns {HTTPStatusCode}
 */
function aaa(a) {
  console.log(a.HTTP_200_OK);
  return 200;
}

// console.log(aaa(HTTPStatusCode));
