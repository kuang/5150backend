import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import {cloneDeep} from 'lodash';

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.updatedRows = new Set();
        this.state = { // state is initialized to just have two column definitions, and no row data.
            // the column definitions and row data are actually updated in compoundDidMount()
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

    /* Determine if date is indeed an actual date
     */
    isDate(date) {
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
    }

    /***
     * Processes
     * @param data
     * @returns {{rowData: Array, columnDefs: []}}
     */
    processData(data) {
        console.log(data);
        let columnDefs = [
            {headerName: 'Name', field: 'name', sortable: true},
            {headerName: 'NetID', field: 'netid', sortable:true},
            {headerName: 'Role', field: 'role', sortable:true, enableCellChangeFlash: true},
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
                    enableCellChangeFlash: true,
                    editable: true
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
     * That is why when you load this page, it starts off empty and then data populates the grid.
     * It is called once, immediately after render() is first called
     */
    componentDidMount() {
        let projectID = this.props.match.params.projectID;
        fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function(newStuff) {
                this.setState({rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"]})
                    }.bind(this))
    }

    /***
     * Makes API call to update all the edited rows prior to this call
     * Clears the edited rows so we don't save the same information twice
     */
    async saveData() {
        console.log("Saving Data");
        let data = this.state.rowData;
        let updatedRows = this.updatedRows;
        let projectName = this.props.match.params.ProjectID;
        let index = updatedRows.next();

        // index is the index of a row that has been updated

        while (index != undefined) {
            let rowData = data[index];
            let netID = rowData["netid"];

            for (let key in rowData) {
                if (this.isDate(key)) {
                    let newData = {
                        "ProjectName": projectName,
                        "NetID": netID,
                        "Dates": key,
                        "HoursPerWeek": Number(rowData[key])
                    };
                    console.log(newData);
                    // let response = await fetch("../api/updateSchedule", {
                    //     method: "PUT",
                    //     body: newData
                    // });
                }
            }

            index = updatedRows.next().value;
        }
        this.updatedRows.clear();
    }

    /***
     * Restores the row data to the last saved row data
     */
    restoreData() {
        console.log(this);
    }

    /***
     * Add the row index of the row that was just edited
     * @param event
     */
    addUpdatedRow(event) {
        this.updatedRows.add(event.rowIndex);
    }
    /***
     * Makes POST Request to save data
     */
    /*** This is what you see on the screen
     *
     * @returns {*}
     */
    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '70vh',
                    width: '100vw'
                }}
            >
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onCellEditingStopped = {this.addUpdatedRow.bind(this)}
                >
                </AgGridReact>

                <button style = {{height:'30px',width:'100px',marginRight: '10px'}}
                        onClick = {
                            this.saveData.bind(this)
                        }
                >
                    Save
                </button>
                <button style = {{height:'30px',width:'100px'}}
                        onClick = {this.restoreData.bind(this)
                        }
                >
                    Cancel
                </button>
            </div>
        );
    }
}

export default Projects_list_page