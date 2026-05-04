// src/AuthSingleton.js
import { createRef } from "react";
export const auth = {
  ref: createRef(),          // el provider lo recibirá
  getToken: () => auth.ref.current?.token,
  login:    (tk) => auth.ref.current?.login(tk),
  logout:   () => auth.ref.current?.logout(),
};
