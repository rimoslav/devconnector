import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

import { GET_ERRORS, SET_CURRENT_USER } from "./types";

// Register User
// Radimo async akciju, vadimo podatke sa backend-a, cekamo odgovor, i onda dispatch-ujemo. za to nam dolazi thunk middleware. dodajemo jos jednu strelicu i dispatch, sto je isto kao da samo unutar funkcije napravili jos jednu funkciju i radili dispatch.
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData) //ne mora localhost: jer smo stavili proxy u package.json
    .then(res => history.push("/login")) //kad registrujemo user-a, on nam vraca tog usera u router.post(/register) u bcrypt.genSalt newUser.then(user => res.json(user))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data //ovo ide u redux state
      })
    ); //isto i za error
};
// Kad registrujemo user-a, ne zelimo da dispatch-ujemo akciju do reducer-a, nego samo da uradimo redirect na login page, a ako bude nekakav error, onda zelimo da taj error dispatch-ujemo GET_ERRORS akciju errorReducer-u
//this.setState ne mozemo da koristimo ovdje u akcijama, to je planirano za komponentu
//umjesto return moramo eksplicitno da pozovemo dispatch

// Login - Get User Token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage
      const { token } = res.data;
      // Set Token to localStorage
      localStorage.setItem("jwtToken", token); //samo stringovi mogu  da se sacuvaju
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token); //user data, issued at, expiration date
      //Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data //ovo ide u redux state
      })
    );
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded //actual user information, exp date...
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
