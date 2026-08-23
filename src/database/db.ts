// V2 - JSON storage, no native deps. Re-exports for compat.
export * from "./json-db.js";
import * as json from "./json-db.js";
export const db = {
  // compat shim so old code that did db.prepare doesn't crash at import time
  // real logic is now in json-db helpers
  prepare: () => { throw new Error("db.prepare removed in V2 - use json-db helpers"); },
  exec: () => {},
  pragma: () => {},
};
