import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import profileReducer from "./profileReducer";

export default combineReducers({
  auth: authReducer, //this.props.auth kad koristimo authReducer u komponentama, ako hocemo da pozovemo action, ili uzemo propertije...
  errors: errorReducer,
  profile: profileReducer
});

//ovo je rootReducer
