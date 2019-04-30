import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      direct: false,
      user: "",
      login: false
    };
    this.loginSuccess = this.loginSuccess.bind(this);
    this.loginError = this.loginError.bind(this);
    this.logoutResponse = this.logoutResponse.bind(this);
  }

  loginSuccess(response) {
    console.log(response);
    this.setState({
      user: response.profileObj.name,
      login: true
    });
  }

  loginError(response) {
    console.log(response);
  }

  logoutResponse(response) {
    console.log("You are logged out");
  }

  render() {
    return (
      <div>
        <div id='login-button'>
          <GoogleLogin
            clientId="795086897508-p73emkkcd287sf6e4nm8jgb45susbcg1.apps.googleusercontent.com"
            buttonText="Login With Google"
            onSuccess={this.loginSuccess}
            onFailure={this.loginError}
            cookiePolicy={'single_host_origin'}
          />
        </div>
        <div id='logout-button'>
          <GoogleLogout
            buttonText="Logout"
            onLogoutSuccess={this.logoutResponse}
          >
          </GoogleLogout>
        </div>
      </div>
    );
  }
}

export default Login

// if (document.getElementById('login')) {
// 	ReactDOM.render(<Login />, document.getElementById('Login'));
// }
