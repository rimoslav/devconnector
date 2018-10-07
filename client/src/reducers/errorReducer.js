import { GET_ERRORS, CLEAR_ERRORS } from "../actions/types";

const initialState = {}; //redux extension prikazuje ovo

//svaki reducer ce da exportuje funkciju. ovo je u stvari action creator
//prilicno sam siguran da je ovaj return unutra automatski dispatch
export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload; //authActions payload: err.response.data sto dolazi sa servera
    case CLEAR_ERRORS:
      return {};
    default:
      return state;
  }
}
