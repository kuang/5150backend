import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Modal from 'react-responsive-modal';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Select from 'react-select';
var moment = require('moment');

class Projects_list_page extends React.Component {

    /*** Constructor that is called when component is initialized. Entry point of this component
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.updatedRows = new Set();
        this.statusOptions = [
            { label: "Ongoing", value: 1 },
            { label: "Inactive", value: 2 },
            { label: "Done", value: 3 },
            { label: "On Hold", value: 4 },
        ];
        this.currentDate = moment();
        this.state = { // state is initialized to just have two column definitions, and no row data.
            // the column definitions and row data are actually updated in compoundDidMount()
            selectedOption : null,
            openTypeWarning: false,
            openNoScheduleWarning: false,
            columnDefs: [{
                headerName: "Name", field: "name", filter: "agTextColumnFilter", cellClass: "suppress-movable-col"// headerName is the name of the column, field is what is
                // referenced by row data. For instance, to create a row for these two column defs, you would do
                // [{"name" : Jonathan Ou}, {"role": "Product Manager"}]
            }, {
                headerName: "Role", field: "role", filter: "agTextColumnFilter", cellClass: "suppress-movable-col"
            }],
            rowData: []
        }
    }

    /***
     * Processes data from /api/displayResourceInfoPerProject
     *
     * @param data
     * @returns {{rowData: Array, columnDefs: []}}, where rowData is the data to be placed in the grid, and column
     * defs is the names of each of the individual columns
     */
    async processData(data) {
        console.log(data);
        let columnDefs = [
            { headerName: 'Name', field: 'name', sortable: true, filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left' },
            { headerName: 'NetID', field: 'netid', sortable: true, filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left' },
            { headerName: 'Role', field: 'role', sortable: true, enableCellChangeFlash: true, filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left'},
        ];
        let rowData = [];
        let columnNames = new Set();
        let prevNetID = null;
        let currentJSON = {};
        let currentWeekRecorded = false;
        let dataIndex = 0;
        for (let i = 0; i < data.length; i++) {
            let currentSchedule = data[i];
            let currentNetID = currentSchedule.NetID;
            let currentHeader = currentSchedule.Dates;
            if (!moment(currentHeader).isSameOrAfter(this.currentDate, 'week')) {
                continue;
            }
            if (!currentWeekRecorded) {
                this.dataIndex = i;
                console.log(this.dataIndex);
                currentWeekRecorded = true;
            }

            let fullName = currentSchedule.FirstName + " " + currentSchedule.LastName;

            if (currentNetID != prevNetID) {
                if (prevNetID != null) {
                    rowData.push(currentJSON);
                }

                let currentRole = currentSchedule.Role;
                prevNetID = currentNetID;
                currentJSON = { netid: currentNetID, name: fullName, role: currentRole };
            }

            let currentHours = currentSchedule.HoursPerWeek;

            if (!columnNames.has(currentHeader)) {
                columnNames.add(currentHeader);
                let newColumnDef = {
                    headerName: currentHeader,
                    field: currentHeader,
                    sortable: true,
                    enableCellChangeFlash: true,
                    editable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                };
                columnDefs.push(newColumnDef);
            }

            currentJSON[currentHeader] = currentHours;
        }

        rowData.push(currentJSON);
        let dates = columnDefs.slice(3);
        let dateComparator = function (a, b) {
            if (a.field < b.field) {
                return -1;
            }
            if (a.field > b.field) {
                return 1;
            }
            return 0;
        };
        dates.sort(dateComparator);
        columnDefs = columnDefs.slice(0, 3).concat(dates);
        return { "rowData": rowData, "columnDefs": columnDefs };
    }

    /***
     * This function is always called right after the constructor for this class is called, and the component is
     * loaded onto a screen via render()
     * It makes a GET request to the api (argument to the fetch function), retrieves it, then processes the data
     * using processData to create new row data and column definitions, and then updates the state to those values.
     * That is why when you load this page, it starts off empty and then data populates the grid.
     * It is called once, immediately after render() is first called
     */
    async componentDidMount() {
        let projectID = this.props.match.params.projectID;
        await fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this));

        let response = await fetch(`../api/displayProjectInfo/${projectID}`);
        let actualResponse = await response.json();
        console.log(actualResponse);
        let currentStatus = actualResponse[0]["Status"];

        if (currentStatus == "Ongoing") {
            this.setState({selectedOption: { label: "Ongoing", value: 1 }});
            return;
        }

        if (currentStatus == "Inactive") {
            this.setState({selectedOption: { label: "Inactive", value: 2 }});
            return;
        }
        if (currentStatus == "Done") {
            this.setState({selectedOption: { label: "Done", value: 3 }});
            return;
        }

        if (currentStatus == "On Hold") {
            this.setState({selectedOption: { label: "On Hold", value: 4 }});
            return;
        }
    }

    /***
     * Makes API call to update all the edited rows prior to this call in the database
     * Also, if project status is updated, saveData() makes an API call to update that as well
     * Clears the edited rows so we don't save the same information twice
     */
    async saveData() {
        console.log("Saving Data");
        let data = this.state.rowData;
        let projectID = this.props.match.params.projectID;
        // let updateSuccessful = await fetch('../api/updateMostRecentRowData', {
        //     method: "PUT",
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ "projectID": projectID, "data": data })
        // });

        let statusUpdateSuccessful = await fetch('../api/updateProjectStatus', {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "ProjectID": projectID, "Status": this.state.selectedOption["label"] })
        });
        console.log(statusUpdateSuccessful);

        let updatedRows = this.updatedRows;

        // index is the index of a row that has been updated

        let processData = async function (pair) {
            let index = pair["rowIndex"];
            let key = pair["colIndex"];
            let netID = data[index]["netid"];
            let hours = data[index][key];
            let newData = {
                "ProjectID": projectID,
                "NetID": netID,
                "Dates": key,
                "HoursPerWeek": hours
            };
            console.log(newData);
            let response = await fetch('../api/updateSchedule', {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });
            console.log(response);
        }
        updatedRows.forEach(processData);
        this.updatedRows.clear();
    }

    /***
     * Restores the row data to the last saved row data
     */
    async restoreData() {
        let projectID = this.props.match.params.projectID;
        let response = await fetch(`../api/displayMostRecentRowData/${projectID}`);
        //     .then(result => result.json())
        //     .then(function(newStuff) {
        //         this.setState({rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"]})
        //     }.bind(this))
        console.log(response.json());
    }

    /***
     * Closes the type warning modal, which is shown when a user types a non-integer value into a week
     */
    closeTypeWarningModal() {
        this.setState({ openTypeWarning: false });
    }

    /***
     * Adds the row index of the row that was just edited to this.updatedRows
     * @param event
     */
    addUpdatedRow(event) {
        console.log("SUP");
        let numericalInput = Number(event.value);
        let editedColumn = event.colDef.field;
        let rowIndex = event.rowIndex;
        if (isNaN(numericalInput)) {
            let oldData = event.oldValue;
            let currentRowData = this.state.rowData;
            let currentRow = currentRowData[rowIndex];
            currentRow[editedColumn] = Number(oldData);
            this.setState({ openTypeWarning: true, rowData: currentRowData });
            event.api.refreshCells();
            return;
        }
        this.updatedRows.add({ "rowIndex": rowIndex, "colIndex": editedColumn });
    }

    /***
     * Determines if a cell is editable
     * @param event
     */
    canEditCell(event) {
        if (event.value == undefined) {
            this.setState({ "openNoScheduleWarning": true });
            return;
        }
    }

    /***
     * Closes no schedule warning modal, which is created when an admin adds data to a week where a resource
     * was not working
     */
    closeNoScheduleWarningModal() {
        this.setState({ openNoScheduleWarning: false });
    }

    /*** Opens the confirmation model
     *
     */
    submitSave() {
        confirmAlert({
            title: 'Confirm To Save',
            message: 'Are you sure to do this?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.saveData()
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    };

    /***
     * Adds another week to the schedule, with the update being reflected in the database
     * @returns {Promise<void>}
     */
    async addOneWeek() {
        console.log("adding a week");
        let projectID = this.props.match.params.projectID;
        let newData = { "ProjectID": projectID };
        let response = await fetch('../api/addOneWeek', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });
        console.log(response);
        fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this))
    }

    async submitAddOneWeek() {
        confirmAlert({
            title: 'Confirm To Add One Week',
            message: 'Are you sure to do this?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.addOneWeek()
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    }

    async deleteOneWeek() {
        console.log("deleting a week");
        let projectID = this.props.match.params.projectID;
        let newData = { "ProjectID": projectID };
        let response = await fetch('../api/deleteLastWeek', {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });
        console.log(response);
        fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this))
    }
    async submitDeleteLastWeek() {
        confirmAlert({
            title: 'Confirm To Delete Last Week',
            message: 'Are you sure to do this?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.deleteOneWeek()
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    }

    handleChange(selection) {
        this.setState({selectedOption: selection});
    }

    async addOldWeek() {
        this.currentDate = this.currentDate.subtract(7, 'days');
        let projectID = this.props.match.params.projectID;
        await fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this));
    }

    /***
     * Makes POST Request to save data
     */
    /*** This is what you see on the screen
     *
     * @returns {*}
     */
    render() {
        let addResPageUrl = '/add_res_to_project/'+this.props.match.params.projectID;
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '62vh',
                    width: '100vw'
                }}
            >
                <Modal open={this.state.openTypeWarning} onClose={this.closeTypeWarningModal.bind(this)} center closeIconSize={14}>
                    <h3 style={{ marginTop: '15px' }}>Please Enter An Integer</h3>
                </Modal>

                <Modal open={this.state.openNoScheduleWarning} onClose={this.closeNoScheduleWarningModal.bind(this)} center closeIconSize={14}>
                    <h3 style={{ marginTop: '15px' }}>Resource Did Not Work This Week</h3>
                </Modal>

                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onCellValueChanged={this.addUpdatedRow.bind(this)}
                    onCellClicked={this.canEditCell.bind(this)}
                    enableCellChangeFlash={true}
                >
                </AgGridReact>

                <button style={{ height: '30px', width: '100px', marginRight: '10px', marginTop: '8px', marginLeft: '8px' }}
                    onClick={
                        this.submitSave.bind(this)
                    }
                >
                    Save
                </button>
                {/*<button style={{ height: '30px', width: '100px', marginRight: '10px' }}*/}
                {/*    onClick={this.restoreData.bind(this)*/}
                {/*    }*/}
                {/*>*/}
                {/*    Revert*/}
                {/*</button>*/}
                <button style={{ height: '30px', width: '100px', marginRight: '10px', marginTop: '8px', marginLeft: '8px' }} onClick={this.submitAddOneWeek.bind(this)}>+ Week</button>

                <button style={{ height: '30px', width: '100px', marginRight: '10px', marginTop: '8px', marginLeft: '8px' }} onClick={this.submitDeleteLastWeek.bind(this)}>- Week</button>

                <div style = {{width: '200px', float :'right', marginTop: '8px', marginLeft: '8px'}}>
                    <Select value = {this.state.selectedOption} onChange = {this.handleChange.bind(this)} options = {this.statusOptions}>
                    </Select>
                </div>

                <button style={{ height: '30px', width: '100px', marginRight: '15px', marginTop: '8px', marginLeft: '8px'}} onClick = {this.addOldWeek.bind(this)}
                >
                    See Old Week
                </button>
                {/*<p style = {{float :'right', 'marginTop' : '7px', 'marginRight' : '10px', "font-size" : '15px'}}><b>Project Status</b></p>*/}

                <Link to={addResPageUrl}>Add Resource</Link>
            </div>
        );
    }
}

export default Projects_list_page