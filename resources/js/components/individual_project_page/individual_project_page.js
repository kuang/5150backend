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
                headerName: "Name", field: "name"
            }, {
                headerName: "Role", field: "role"
            }],
            rowData: []
        }
    }

    processData(data) {
        let columnDefs = [
            {headerName: 'Name', field: 'name', sortable: true, enableCellChangeFlash: true},
            {headerName: 'Role', field: 'role', editable: true, enableCellChangeFlash: true},
        ];
        let rowData = [];
        let columnNames = new Set();
        let prevNetID = null;
        let currentJSON = {};

        for (let i = 0; i < data.length; i++) {
            let currentSchedule = data[i];
            let currentNetID = currentSchedule.NetID;
            let currentHeader = currentSchedule.Dates;

            if (currentNetID != prevNetID) {
                if (prevNetID != null) {
                    rowData.push(currentJSON);
                }

                let currentRole = currentSchedule.Role;
                prevNetID = currentNetID;
                currentJSON = {name: currentNetID, role: currentRole};
            }

            let currentHours = currentSchedule.HoursPerWeek;

            if (!columnNames.has(currentHeader)) {
                columnNames.add(currentHeader);
                let newColumnDef = {
                    headerName: currentHeader,
                    field: currentHeader,
                    sortable: true,
                    enableCellChangeFlash: true
                };
                columnDefs.push(newColumnDef);
            }

            currentJSON[currentHeader] = currentHours;
        }

        rowData.push(currentJSON);

        return {"rowData" : rowData, "columnDefs" : columnDefs};
    }

    componentDidMount() {
        let projectID = this.props.match.params.projectID;
        fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(newStuff => this.setState(
                {rowData: newStuff["rowData"],
                columnDefs: newStuff["columnDefs"]}))
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '500px',
                    width: '600px' }}
            >
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}>
                </AgGridReact>
            </div>
        );
    }
}

export default Projects_list_page