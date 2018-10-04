//Axios dozvoljava da se postavi default header pri zahtjevima, to je jedan od razloga sto je izabran axios. Zahvaljujuci ovome mozemo da u header-u uvijek da stavimo token da se salje
import axios from "axios";

const setAuthToken = token => {
  if (token) {
    //Apply to every request
    axios.defaults.headers.common["Authorization"] = token; //tako se zvao u PostMan-u - 'Auth...'
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
