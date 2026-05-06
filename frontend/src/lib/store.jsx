// QuestLoop — src/lib/store.js
// Minimal global state via React context + useReducer

import { createContext, useContext, useReducer } from "react";

const initial = {
  wallet: null,       // { address, id }
  token: localStorage.getItem("ql_token") || null,
  toast: null,        // { message, type: 'success'|'error'|'info' }
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WALLET":
      return { ...state, wallet: action.payload, token: action.token };
    case "CLEAR_WALLET":
      localStorage.removeItem("ql_token");
      return { ...state, wallet: null, token: null };
    case "TOAST":
      return { ...state, toast: action.payload };
    case "CLEAR_TOAST":
      return { ...state, toast: null };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  return useContext(Ctx);
}