import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Individual_resource_page extends Component {

    constructor(props) {
        super(props);
        this.state = {
            resourceFullName: "",
            projectIDs: "",
        };
    }
    componentDidMount() {
        fetch('/api/displayProjectsPerResource/' + this.props.resourceID)
            .then(res => res.json())
            .then(
                (result) => {
                    let string_result = JSON.stringify({ result })
                    this.setState({ projectIDs: string_result });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    return <h2>failed</h2>;
                });

        fetch('/api/displayResourceInfo/' + this.props.resourceID)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        resourceFullName: result[0].FirstName + " " + result[0].LastName
                    })
                    console.log(result);

                },
                (error) => {
                    return <h2>failed</h2>;
                });
    }

    render() {
        return (
            <div>
                <h1>Resource name: {this.state.resourceFullName}</h1>

                <h2>ProjectIDs: {this.state.projectIDs}</h2>
            </div>
        );
    }
}



export default Individual_resource_page
