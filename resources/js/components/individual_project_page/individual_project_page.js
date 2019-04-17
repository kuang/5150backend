import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // state is initialized to just have two column definitions, and no row data.
            // the column defintions and row data are actually updated in compoundDidMount()
            columnDefs: [{
                headerName: "Name", field: "name" // headerName is the name of the column, field is what is
                // referenced by row data. For instance, to create a row for these two column defs, you would do
                // [{"name" : Jonathan Ou}, {"role": "Product Manager"}]
            }, {
                headerName: "Role", field: "role"
            }],
            rowData: []
        }
    }

    /***
     * Processes
     * @param data
     * @returns {{rowData: Array, columnDefs: *[]}}
     */
    processData(data) {
        console.log(data);
        let columnDefs = [
            {headerName: 'Name', field: 'name', sortable: true},
            {headerName: 'NetID', field: 'netid', sortable:true},
            {headerName: 'Role', field: 'role', editable: true, sortable:true, enableCellChangeFlash: true},
        ];
        let rowData = [];
        let columnNames = new Set();
        let prevNetID = null;
        let currentJSON = {};

        for (let i = 0; i < data.length; i++) {
            let currentSchedule = data[i];
            let currentNetID = currentSchedule.NetID;
            let currentHeader = currentSchedule.Dates;
            let fullName = currentSchedule.FirstName + " " + currentSchedule.LastName;

            if (currentNetID != prevNetID) {
                if (prevNetID != null) {
                    rowData.push(currentJSON);
                }

                let currentRole = currentSchedule.Role;
                prevNetID = currentNetID;
                currentJSON = {netid: currentNetID, name : fullName, role: currentRole};
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

    /***
     * This function is always called right after the constructor for this class is called
     * It makes a GET request to the api (argument to the fetch function), retrieves it, then processes the data
     * using processData to create new row data and column definitions, and then updates the state to those values.
     * That is why when you load this page, it starts off empty and then data populates the grid
     */
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
                    height: '80vh',
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