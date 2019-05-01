import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';
import { LoginContext } from './App';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permision: "read",
      user: null,
      login: false
    };
    this.loginSuccess = this.loginSuccess.bind(this);
    this.loginError = this.loginError.bind(this);
    this.logoutResponse = this.logoutResponse.bind(this);
  }

  loginSuccess(response, toggleValue) {
    console.log(response);
    this.setState({
      user: response.profileObj.name,
      login: true
    });
    toggleValue("logged");
  }

  loginError(response, toggleValue) {
    toggleValue("unlogged");
    console.log(response);
  }

  logoutResponse(response, toggleValue) {
    this.setState({
      user: null,
      login: false
    });
    toggleValue("unlogged");
    console.log("You are logged out");
  }

  renderButton(toggleValue) {
    var toreturn = (
      !this.state.login
        ? <div id='login-button'>
          <GoogleLogin
            clientId="795086897508-p73emkkcd287sf6e4nm8jgb45susbcg1.apps.googleusercontent.com"
            buttonText="Login With Google"
            onSuccess={response => this.loginSuccess(response, toggleValue)}
            onFailure={response => this.loginError(response, toggleValue)}
            cookiePolicy={'single_host_origin'}
          />
        </div>
        : <div id='logout-button'>
          <GoogleLogout
            buttonText="Logout"
            onLogoutSuccess={response => this.logoutResponse(response, toggleValue)}
          >
          </GoogleLogout>
        </div>
    )
    console.log(toreturn);
    return toreturn;
  }

  render() {
    return (
      <div>
        <LoginContext.Consumer>
          {({ value, toggleValue }) => 
            (this.renderButton(toggleValue))
          }
          {/* {!this.state.login
            ? <div id='login-button'>
              <GoogleLogin
                clientId="795086897508-p73emkkcd287sf6e4nm8jgb45susbcg1.apps.googleusercontent.com"
                buttonText="Login With Google"
                onSuccess={this.loginSuccess}
                onFailure={this.loginError}
                cookiePolicy={'single_host_origin'}
              />
            </div>
            : <div id='logout-button'>
              <GoogleLogout
                buttonText="Logout"
                onLogoutSuccess={this.logoutResponse}
              >
              </GoogleLogout>
            </div>
          } */}
        </LoginContext.Consumer>
      </div>
    );
  }
}

export default Login

// if (document.getElementById('login')) {
// 	ReactDOM.render(<Login />, document.getElementById('Login'));
// }
