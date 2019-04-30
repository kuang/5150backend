import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import GoogleLogout from 'react-google-login';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      direct: false
    }
  }

  render() {
    const responseGoogle = (response) => {
      console.log(response);
    }

    return (
      <GoogleLogin
        clientId="795086897508-p73emkkcd287sf6e4nm8jgb45susbcg1.apps.googleusercontent.com"
        buttonText="Login With Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    );
  }
}

export default Login

// if (document.getElementById('login')) {
// 	ReactDOM.render(<Login />, document.getElementById('Login'));
// }
