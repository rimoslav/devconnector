import React, { Component } from "react";
import PropTypes from "prop-types"; //React: svaki properti koji imas u komponenti treba da map-ujes na prop-types. mozes da ih podesis kog su tipa, da li su required ili ne.
import { withRouter } from "react-router-dom";
import { connect } from "react-redux"; //kad god koristis redux u nekoj komponenti, npr Register
import { registerUser } from "../../actions/authActions"; //import actions
import TextFieldGroup from "../common/TextFieldGroup";

//container je react component koja radi sa redux-om
//gore smo zvali connect iz react-redux da bi spojili react i redux, to je i svrha tog modula

class Register extends Component {
  constructor() {
    //da napravimo component state (ne aplication state)
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };
    //kad kliknemo submit pozvacemo registerUser u actions, dispecovace reduceru, msm da je to authReducer.js, popunice user objekat. mapovali smo auth state na properti u ovoj komponenti, pa cemo testirati da vidimo jel ima user. ako ima, za sad ce ga samo ispisati, ali brisemo to.
    this.props.registerUser(newUser, this.props.history); //svaku akciju koju zovemo zvacemo kroz props (zahvaljujuci connect). history da bi mogli redirect na then u axios request-u
  }

  render() {
    const { errors } = this.state; // const errors = this.state.errors;
    //rename class u className
    //a href <---> Link to
    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">
                Create your DevConnector account
              </p>
              <form noValidate onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="Name"
                  name="name"
                  value={this.state.name}
                  onChange={this.onChange}
                  error={errors.name}
                />
                <TextFieldGroup
                  placeholder="Email Address"
                  name="email"
                  type="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  error={errors.email}
                  info="This site uses Gravatar so if you want a profile image, use a Gravatar email"
                />
                <TextFieldGroup
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  error={errors.password}
                />
                <TextFieldGroup
                  placeholder="Confirm Password"
                  name="password2"
                  type="password"
                  value={this.state.password2}
                  onChange={this.onChange}
                  error={errors.password2}
                />
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  //ImeKomponente.propTypes = Objekat
  registerUser: PropTypes.func.isRequired, //akcija, ali je i properti
  auth: PropTypes.object.isRequired, //i jedno i drugo, i trece vidimo da su mapovani dole
  errors: PropTypes.object.isRequired
};
// ako hocemo da proslijedimo bilo sta iz auth state-a u nasu komponentu treba nam f-ja mapStateToProps
const mapStateToProps = state => ({
  //potrebno za connect prema react-redux uputstvu, tako je nazovi, da bi mogli da prosledjujemo state komponenti kroz props, kao sto dole i pise
  auth: state.auth, //ovo state.auth je auth iz root Reducer-a, index.js, tj = authReducer. ovo prvo auth mozes nazvati kako god hoces. mozemo pristupiti state.auth preko this.props.auth zbog lijevog imena auth
  errors: state.errors //ovo dolazi iz Redux Store-a, mi ga vezemo za props, prosledjujemo ga gore lokalnom state-u komponente, a onda ga odatle uzimamo, dajemo ime const errors i ispisujemo na komponenti
});

export default connect(
  mapStateToProps, //kada se upadate-uje Store, komponenta (Register) biva svjesna i dobija update kroz props
  { registerUser } //action creator. objekat gdje mozemo da mapujemo nase akcije
)(withRouter(Register)); //druga zagrada je withRouter(ImeKomponente)

//mapStateToProps vraca objekat. mapDispatchToProps = { registerUser } isto vraca objekat. { registerUser } je returnovano, dispecovano iz authActions, tako da ga posmatramo kao dispatch. connect njih spaja, i samo onim komponentama koje su unutar Provider-a, a to Register jeste, dostavlja to sto ovo dvoje return-uju. Dakle dostavljaju onome sto je u drugoj zagradi, tj (ImeKomponente)
