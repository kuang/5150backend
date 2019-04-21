import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: 'Project', field: 'projectName', sortable: true },
                { headerName: 'Most Recent Updates', field: 'updates' },
                { headerName: 'Start Date', field: 'startDate' },
                { headerName: 'Due Date', field: 'dueDate' },
                { headerName: 'Status', field: 'status' },
                { headerName: 'Technology', field: 'tech' },
                { headerName: 'Assigned Resources', field: 'resources' },
                { headerName: 'Assigned Hours This Week', field: 'hoursWeek' },
                { headerName: 'Total Assigned Hours', field: 'hoursTotal' }
            ],
            rowData: []
        }
    }

    /** Returns a concatenated string of a list of the first names of the resources
     *  associated with a particular project with [projectID]
     */
    async getResourceNames(projectID) {
        // need to access ResourcesPerProject table,
        // then find all ResourceID's that matches with the ProjectID,
        // then access Resources table and use the list of ResourceID's to find their names
        return fetch(`../api/displayResourcesPerProject/${projectID}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJSON) {
                if (myJSON === undefined || myJSON.length == 0) {
                    return "None";
                } else {
                    var names = myJSON.map(function (a) { return a.FirstName; });
                    names = names.join(", ");
                    return names
                    }
            });
    }

    async processData(data) {
        var rowData = [];
        var rowJSON = {};
        for (let i = 0; i < data.length; i++) {
            let currJSON = data[i];
            console.log(currJSON);
            let currProjectID = currJSON.ProjectID;
            let currProjectName = currJSON.ProjectName;
            let currStatus = currJSON.Status;
            let currTech = currJSON.Technology;
            let currStartDate = currJSON.StartDate;
            let currDueDate = currJSON.DueDate;
            let currHoursTotal= currJSON.EstMaxHours;
            let currResources = await this.getResourceNames(currProjectID); 
            console.log(currResources);
            let currHoursWeek = "";
            let currUpdates = "";

            rowJSON = {
                projectName : currProjectName,
                updates: currUpdates,
                startDate: currStartDate,
                dueDate: currDueDate,
                status : currStatus,
                tech : currTech,
                resources: currResources,
                hoursWeek : currHoursWeek,
                hoursTotal: currHoursTotal
            };
            rowData.push(rowJSON);
        }

        console.log(rowData);
        return rowData
    }

    componentDidMount() {
        fetch(`../api/displayAllProjects`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newData) {
                this.setState({ rowData: newData })
            }.bind(this))
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '65vh',
                    width: '100vw'
                }}
            >

                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                >
                </AgGridReact>
            </div>
        );
    }
}

export default Projects_list_page