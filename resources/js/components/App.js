import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.js'
import Individual_resource_page from './individual_resource_page/individual_resource_page.js'
import Individual_project_page from './individual_project_page/individual_project_page.js'
// import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Projects_list_page from './projects_list_page/projects_list_page.js'
import Resource_list_page from './resource_list_page/resource_list_page.js'

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
                            <li>
                                <Link to="/individual_resource/">individual_resource</Link>
                            </li>
                            <li>
                                <Link to="/individual_project/25">projects</Link>
                            </li>
                            <li>
                                <Link to="/projects_list/">List of projects</Link>
                            </li>
                        </ul>
                    </nav>

                    <Route path="/" exact component={Index} />
                    <Route path="/about/" component={About} />
                    <Route path="/users/" component={Users} />
                    <Route path="/resource/" component={Resource_list_page} />
                    <Route
                        path='/individual_resource/'
                        render={(props) => <Individual_resource_page {...props} resourceID={4} />}
                    />

                    <Route
                        path="/individual_project/:projectID"
                        component={Individual_project_page}
                    />
                    <Route path="/projects_list/" component={Projects_list_page} />
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