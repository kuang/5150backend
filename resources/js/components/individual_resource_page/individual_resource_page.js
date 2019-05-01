import React, { Component } from 'react';
import ReactList from 'react-list';
import { Link } from 'react-router-dom'
import Modal from 'react-responsive-modal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Individual_resource_page extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            oldNetID: "",
            netID: "",
            hours: 0,
            projects: "",
            openEdit: false,
            columnDefs: [{
                headerName: "Name", field: "name"
            }],
            // state variables needed for resource form
            rowData: [],
        };
        // this.renderItem = this.renderItem.bind(this);
    }
    async processData(data) {
        let columnDefs = [{
            headerName: 'Project',
            field: 'project',
            width: 100,
            filter: "agTextColumnFilter",
            suppressMovable: true,
            pinned: 'left'
        }
            // , {
            //     headerName: 'Details',
            //     field: 'detailLink',
            //     width: 100,
            //     filter: "agTextColumnFilter",
            //     suppressMovable: true,
            //     pinned: 'left',
            //     cellRenderer: function (params) {
            //         return "<a href='/individual_project/" + params.value + "'>Details</a>"
            //     }
            // }
        ]

        let rowData = [];
        let currJSON = {};
        let colNames = new Set();
        let prevProjectName = null;

        for (let i = 0; i < data.length; i++) {
            let curr = data[i];
            let currHeader = curr.Dates;
            let currProjectName = curr.ProjectName;
            let numHours = curr.HoursPerWeek;

            // new row
            if (currProjectName != prevProjectName) {
                if (prevProjectName != null) {
                    rowData.push(currJSON);
                }
                prevProjectName = currProjectName;
                currJSON = {
                    project: currProjectName,
                    // detailLink: id
                };
            }
            let currHours = curr.HoursPerWeek;
            if (!colNames.has(currHeader)) {
                colNames.add(currHeader);
                let newColDef = {
                    headerName: currHeader,
                    field: currHeader,
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                };
                columnDefs.push(newColDef);
            }
            currJSON[currHeader] = currHours;
        }
        rowData.push(currJSON);
        console.log("rowData");
        console.log(rowData);
        console.log("columnDefs");
        console.log(columnDefs);
        return { "rowData": rowData, "columnDefs": columnDefs };
    }

    componentDidMount() {

        fetch('../api/displayIndividualResourceHours/' + this.props.match.params.resourceID)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newData) {
                this.setState({ rowData: newData["rowData"], columnDefs: newData["columnDefs"] })
            }.bind(this));
        // .then(res => res.json())
        // .then(
        //     (result) => {
        //         console.log(result);
        //         // this.setState({ projects: result });
        //     },
        //     // Note: it's important to handle errors here
        //     // instead of a catch() block so that we don't swallow
        //     // exceptions from actual bugs in components.
        //     (error) => {
        //         return <h2>failed</h2>;
        //     });




        fetch('/api/displayResourceInfo/' + this.props.match.params.resourceID)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log(result)
                    this.setState({
                        firstName: result[0].FirstName,
                        lastName: result[0].LastName,
                        oldNetID: result[0].NetID,
                        netID: result[0].NetID,
                        hours: result[0].MaxHoursPerWeek
                    })
                    console.log(result);

                },
                (error) => {
                    return <h2>failed</h2>;
                });
    }

    closeEditModal() {
        this.setState({ openEdit: false });
    }
    openEditModal() {
        this.setState({ openEdit: true });
    }
    //TODO: handle HTTP PUT call
    async handleSubmit(event) {
        let data = {
            "OldNetID": this.state.oldNetID,
            "NewNetID": this.state.netID,
            "FirstName": this.state.firstName,
            "LastName": this.state.lastName,
            "MaxHoursPerWeek": this.state.hours
        }

        console.log("handleSubmit called");
        console.log(data);
        let response = await fetch('../api/updateResource', {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

    }
    // sorta wacky- e.target.id is the id of the input, which corresponds to keys in State.
    handleChange(e) {
        this.setState({
            [e.target.id]: e.target.value
        });
    }




    // renders each individual row of the projects list.
    // renderItem(index, key) {
    //     if (this.state.projects.length != 0) {
    //         return (
    //             <div key={key} style={{ borderStyle: 'solid' }}>
    //                 <div>{this.state.projects[index].ProjectName}</div>
    //                 <div>Start Date: {this.state.projects[index].StartDate}</div>
    //             </div >
    //         );
    //     }
    //     else {
    //         return <div></div>;
    //     }
    // }

    render() {
        return (
            <div>
                <Modal open={this.state.openEdit} onClose={this.closeEditModal.bind(this)} center closeIconSize={14}>
                    <h4 style={{ marginTop: '15px' }}>Resource Information</h4>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            First Name:
                            <input style={{ float: 'right' }} type="text" id="firstName" defaultValue={this.state.firstName} onChange={this.handleChange.bind(this)} />
                        </label>
                        <br></br>

                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Last Name:
                        <input style={{ float: 'right' }} type="text" id="lastName" defaultValue={this.state.lastName} onChange={this.handleChange.bind(this)} />
                        </label>
                        <br></br>

                        <label style={{ marginRight: '15px', width: '100%' }}>
                            netID:
                            <input style={{ float: 'right' }} type="text" id="netID" defaultValue={this.state.netID} onChange={this.handleChange.bind(this)} />
                        </label>
                        <br></br>

                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Max hours per Week:
                            <input style={{ float: 'right' }} type="text" id="hours" defaultValue={this.state.hours} onChange={this.handleChange.bind(this)} />
                        </label>
                        <br></br>
                        <input type="submit" value="Submit" />
                    </form>

                </Modal>

                <div style={{ overflow: 'auto', width: '50%', float: 'left' }}>
                    <h1>Resource name: {this.state.firstName} {this.state.lastName}</h1>
                    <button type='button' onClick={this.openEditModal.bind(this)}>Edit Resource</button>
                </div>
                <div style={{ overflow: 'auto', width: '100%' }}>
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '62vh',
                            width: '100vw'
                        }}
                    >
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                        // onCellClicked={this.cellClicked.bind(this)}
                        ></AgGridReact>
                    </div>

                </div >
            </div >
        );
    }
}



export default Individual_resource_page
