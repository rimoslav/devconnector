import isEmpty from "../validation/is-empty";

import { SET_CURRENT_USER } from "../actions/types";

const initialState = {
  isAuthenticated: false,
  user: {}
}; //redux extension prikazuje ovo

//svaki reducer ce da exportuje funkciju. ovo je u stvari action creator
//prilicno sam siguran da je ovaj return unutra automatski dispatch
export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    default:
      return state;
  }
}
