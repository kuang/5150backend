import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                headerName: 'Project', field: 'projectName'
            }],
            rowData: []
        }
    }

    async processData(data) {
        var columnDefs = [
            { headerName: 'Project', field: 'projectName', sortable: true },
            { headerName: 'Status', field: 'status', sortable: true},
            { headerName: 'Technology', field: 'tech', sortable: true },
            { headerName: 'Maximum Hours', field: 'maxHour', sortable: true},
            { headerName: 'Start Date', field: 'startDate'},
            { headerName: 'Due Date', field: 'dueDate'}
        ];
        var rowData = [];
        var rowJSON = {};
        for (let i = 0; i < data.length; i++) {
            let currJSON = data[i];
            let currProjectName = currJSON.projectName;
            let currStatus = currJSON.Status;
            let currTech = currJSON.Technology;
            let currMaxHour = currJSON.EstMaxHours;
            let currStartDate = currJSON.StartDate;
            let currDueDate = currJSON.DueDate;

            rowJSON = {
                projectName : currProjectName,
                status : currStatus,
                tech : currTech,
                maxHour : currMaxHour,
                startDate : currStartDate,
                dueDate : currDueDate
            };
            rowData.push(rowJSON);
        }

        console.log(rowData);
        return { "rowData": rowData, "columnDefs": columnDefs };
    }

    componentDidMount() {
        fetch(`../api/displayAllProjects`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newData) {
                this.setState({ rowData: newData["rowData"], columnDefs: newData["columnDefs"] })
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