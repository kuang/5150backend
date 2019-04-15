import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.js'
import Individual_resource_page from './individual_resource_page/individual_resource_page.js'

// import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/about/">About</Link>
                            </li>
                            <li>
                                <Link to="/users/">Users</Link>
                            </li>
                            <li>
                                <Link to="/resource/">resource</Link>
                            </li>
                        </ul>
                    </nav>

                    <Route path="/" exact component={Index} />
                    <Route path="/about/" component={About} />
                    <Route path="/users/" component={Users} />
                    <Route path="/resource/" component={Individual_resource_page} />
                </div>
            </Router>
        );
    }
}

function Index() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}


export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}