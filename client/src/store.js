import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk"; //redux-thunk je middleware koji cemo koristiti da, kad napravimo ajax request, sacekamo taj request i onda dispatch-ujemo reducer-u
import rootReducer from "./reducers"; // ./reducers/index, pa zato ne mora, jer se zove index.js
//imacemo vise reducer-a, authReducer, profileReducer, postReducer, errorReducer
//uradicemo combineReducers
const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer, // rootReducer je combineReducers(pa svi reduceri)
  initialState,
  compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;

//Cijeli workflow Redux-a:
//1. commit-ujemo akciju registerUser u Register.js
//2. u authActions.js dispatch-ujemo tu akciju (tip: neki test, payload: podaci)
//3. u authReducer smo u state ukljucili novog user-a.
//4. u nasoj komponenti Register.js smo mapovali state na props (mapStateToProps), postavili auth kao prop u nasoj komponenti
//5. onda smo, isto u Register.js iz tog auth izvadili user-a i samo ga ispisali na stranici, ako postoji, ako ne, nista.
