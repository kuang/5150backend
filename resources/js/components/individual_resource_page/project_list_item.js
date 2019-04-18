import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Project_list_item extends Component {

    constructor(props) {
        super(props);
        // this.state = {
        //     projectIDs: "",
        // };
    }
    componentDidMount() {
        let projectID = this.props.projectID;
        fetch(`../api/displayProjectInfo/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this))
    }


    render() {
        // fetch('/api/displayProjectsPerResource/' + this.props.resourceID)
        //     .then(res => res.json())
        //     .then(
        //         (result) => {
        //             let string_result = JSON.stringify({ result })
        //             this.setState({ projectIDs: string_result });
        //         },
        //         // Note: it's important to handle errors here
        //         // instead of a catch() block so that we don't swallow
        //         // exceptions from actual bugs in components.
        //         (error) => {
        //             return <h2>failed</h2>;
        //         });

        // return <h2>ProjectIDs: {this.state.projectIDs}</h2>;
    }
}



export default Project_list_item
