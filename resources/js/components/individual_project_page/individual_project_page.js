import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Modal from 'react-responsive-modal';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Select from 'react-select';
import ReactNotification from "react-notifications-component";
import TextareaAutosize from "react-autosize-textarea";

let moment = require('moment');
class Individual_project_page extends React.Component {

    /*** Constructor that is called when component is initialized. Entry point of this component
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.addDueDateNotification = this.addDueDateNotification.bind(this);
        this.notificationDOMRef = React.createRef();
        this.updatedRows = new Set();
        this.statusOptions = [
            { label: "Ongoing", value: 1 },
            { label: "Inactive", value: 1 },
            { label: "Done", value: 1 },
            { label: "On Hold", value: 1 },
        ];
        this.dueDate = undefined; // dueDate of the project
        this.currentDate = moment();
        this.latestDate = undefined;
        this.state = { // state is initialized to just have two column definitions, and no row data.
            // the column definitions and row data are actually updated in compoundDidMount()
            selectedOption : "",
            openTypeWarning: false,
            openNoScheduleWarning: false,
            columnDefs: [{
                headerName: "Name", field: "name", filter: "agTextColumnFilter", cellClass: "suppress-movable-col"// headerName is the name of the column, field is what is
                // referenced by row data. For instance, to create a row for these two column defs, you would do
                // [{"name" : Jonathan Ou}, {"role": "Product Manager"}]
            }, {
                headerName: "Role", field: "role", filter: "agTextColumnFilter", cellClass: "suppress-movable-col"
            }],
            rowData: [],
            openProjectFormModal: false,
            updatedProjectName: "",
            updatedProjectTechnology: "",
            updatedProjectDueDate: "",
            updatedProjectStartDate: "",
            updatedProjectMaxHours: "",
            openCommentView: false,
            updatedCommentUser : "",
            updatedCommentNetID: "",
            updatedCommentWeek: "",
            updatedCommentData: ""
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
            { headerName: 'NetID', field: 'netid', sortable: true, filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left', hide:true},
            { headerName: 'Role', field: 'role', sortable: true, enableCellChangeFlash: true, filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left'},
        ];
        let rowData = [];
        let columnNames = new Set();
        let prevNetID = null;
        let currentJSON = {};
        let currentWeekRecorded = false;
        for (let i = 0; i < data.length; i++) {
            let currentSchedule = data[i];
            let currentNetID = currentSchedule.NetID;
            let currentHeader = currentSchedule.Dates;
            if (!moment(currentHeader).isSameOrAfter(this.currentDate, 'week')) {
                continue;
            }
            if (!currentWeekRecorded) {
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
        this.latestDate = dates[dates.length-1].field;
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
        let currentStatus = actualResponse[0]["Status"];
        this.dueDate = actualResponse[0]["DueDate"];
        let theSelectedOption = {};
        if (currentStatus == "Ongoing") {
            theSelectedOption= { label: "Ongoing", value: 1 };
        }

        else if (currentStatus == "Inactive") {
            theSelectedOption={ label: "Inactive", value: 2 };
        }

        else if (currentStatus == "Done") {
            theSelectedOption = { label: "Done", value: 3 };
        }

        else if (currentStatus == "On Hold") {
           theSelectedOption = { label: "On Hold", value: 4 };
        }

        let projectName = actualResponse[0]["ProjectName"];
        let technology = actualResponse[0]["Technology"];
        let maxHours = actualResponse[0]["EstMaxHours"];
        let startDate = actualResponse[0]["StartDate"];
        let dueDate = actualResponse[0]["DueDate"];
        this.setState({
            updatedProjectName: projectName,
            updatedProjectTechnology: technology,
            updatedProjectMaxHours: maxHours,
            updatedProjectStartDate: startDate,
            updatedProjectDueDate: dueDate,
            selectedOption: theSelectedOption
        });
    }

    /***
     * Makes API call to update all the edited rows prior to this call in the database
     * Also, if project status is updated, saveData() makes an API call to update that as well
     * Clears the edited rows so we don't save the same information twice
     */
    async saveData() {
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

        // let statusUpdateSuccessful = await fetch('../api/updateProjectStatus', {
        //     method: "PUT",
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ "ProjectID": projectID, "Status": this.state.selectedOption["label"] })
        // });

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
            let response = await fetch('../api/updateSchedule', {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });
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
            this.setState({ openNoScheduleWarning: true });
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
            message: 'Are you sure you want to do this?',
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
        let response2 = await fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this));
        
        if (moment(this.latestDate).isAfter(this.dueDate)) {
            this.addDueDateNotification();
            let updatedData = {"ProjectID" : projectID, "DueDate" : this.latestDate};
            await fetch('../api/updateProjectDueDate', {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            this.dueDate = this.latestDate;
        }
    }

    async submitAddOneWeek() {
        confirmAlert({
            title: 'Confirm To Add One Week',

            message: 'Are you sure you want to do this?',
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
            message: 'Are you sure you want to do this?',
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

        // TODO: perhaps cache the data so there is no need to keep on maybe API calls
        await fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newStuff) {
                this.setState({ rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"] })
            }.bind(this));
    }

    addDueDateNotification() {
        this.notificationDOMRef.current.addNotification({
            title: "Warning",
            message: "Project Will Be Overdue",
            type: "warning",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: { duration: 5000 },
            dismissable: { click: true }
        });
    }

    async displayComment(event) {
        let projectID = this.props.match.params.projectID;
        let netID = event.data.netid;
        let date = event.colDef.headerName;
        let name = event.data.name;
        console.log(event);
        let response = await fetch(`../api/getComment/${projectID}/${netID}/${date}`);
        let commentData = await response.json();
        let comment = commentData[0]["Comment"];
        if (comment != "") {
            this.notificationDOMRef.current.addNotification({
                title: name + " For The Week Of " + date,
                message: comment,
                type: "warning",
                insert: "top-right",
                container: "top-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: { duration: 0 },
                dismissable: { click: true }
            });
        }
    }

    closeFormModal() {
        this.setState({openProjectFormModal :false});
    }

    handleFormInputChange(e) {
        this.setState({[e.target.id] : e.target.value});
    }

    /***
     * Code also will issue get request to get the comment for the respective net id and name
     * @param e
     */
    handleCommentFormInputChange(e) {
        this.setState({[e.target.id] : e.target.value});
        console.log(this);
    }
    /*** Handle PUT Request(s) upon form being submitted
     *
     * @param event
     */
    async handleFormSubmit(event) {
        let projectID = this.props.match.params.projectID;
        let newData = {
            "ProjectID" : projectID,
            "DueDate" : this.state.updatedProjectDueDate,
            "StartDate" : this.state.updatedProjectStartDate,
            "Technology" : this.state.updatedProjectTechnology,
            "Status" : this.state.selectedOption["label"],
            "ProjectName" : this.state.updatedProjectName,
            "EstMaxHours" : this.state.updatedProjectMaxHours
        };

        let response = await fetch('../api/updateIndividualProjectInfo', {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

    }

    openProjectForm() {
        this.setState({openProjectFormModal : true});
    }

    viewComments() {

    }

    closeCommentViewModal() {
        this.setState({openCommentView : false});
    }

    openCommentViewModal() {
        this.setState({openCommentView : true});
    }
    /***
     * Makes POST Request to save data
     */
    /*** This is what you see on the screen
     *
     * @returns {*}
     */

    handleCommentFormSubmit() {

    }

    handleCommentFormUserUpdate(selection) {
        this.setState({updatedCommentUser:selection});
        console.log(this);
    }

    handleCommentFormNetIDUpdate(selection) {
        this.setState({updatedCommentNetID:selection});
        console.log(this);
    }

    handleCommentFormWeekUpdate(selection) {
        this.setState({updatedCommentWeek:selection});
        console.log(this);
    }
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

                <Modal open={this.state.openCommentView} onClose={this.closeCommentViewModal.bind(this)} center closeIconSize={14}>
                    <form onSubmit={this.handleCommentFormSubmit.bind(this)}>
                        <br></br>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Name:
                            <br></br>
                            <Select value = {this.state.updatedCommentUser} onChange = {this.handleCommentFormUserUpdate.bind(this)} options = {this.statusOptions}>
                            </Select>

                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            NetID:
                            <br></br>
                            <Select value = {this.state.updatedCommentNetID} onChange = {this.handleCommentFormNetIDUpdate.bind(this)} options = {this.statusOptions}>
                            </Select>

                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Week:
                            <br></br>
                            <Select value = {this.state.updatedCommentWeek} onChange = {this.handleCommentFormWeekUpdate.bind(this)} options = {this.statusOptions}>
                            </Select>
                        </label>

                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Comment:
                            <br></br>
                            <TextareaAutosize style = {{width:"100%"}} maxRows={6}>

                            </TextareaAutosize>

                        </label>

                        <input type="submit" value="Submit" />

                    </form>
                </Modal>

                <Modal open={this.state.openNoScheduleWarning} onClose={this.closeNoScheduleWarningModal.bind(this)} center closeIconSize={14}>
                    <h3 style={{ marginTop: '15px' }}>Resource Did Not Work This Week</h3>
                </Modal>

                <Modal open ={this.state.openProjectFormModal} onClose= {this.closeFormModal.bind(this)}
                >
                    <form onSubmit={this.handleFormSubmit.bind(this)}>
                        <br></br>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Name:
                            <input id  = "updatedProjectName" style = {{float: 'right'}} type="text" required value={this.state.updatedProjectName} onChange={this.handleFormInputChange.bind(this)} />
                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Technology:
                            <input id = "updatedProjectTechnology" style = {{float: 'right'}} type="text" required value={this.state.updatedProjectTechnology} onChange={this.handleFormInputChange.bind(this)} />
                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            MaxHours:
                            <input id = "updatedProjectMaxHours" style = {{float: 'right'}} type="number" min="0" required value={this.state.updatedProjectMaxHours} onChange={this.handleFormInputChange.bind(this)} />
                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            StartDate:
                            <input id = "updatedProjectStartDate" style = {{float: 'right'}} type="date" required value={this.state.updatedProjectStartDate}
                                   onChange={this.handleFormInputChange.bind(this)} />
                        </label>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            DueDate:
                            <input id = "updatedProjectDueDate" style = {{float: 'right'}} type="date" required value={this.state.updatedProjectDueDate}
                                   onChange={this.handleFormInputChange.bind(this)} />
                        </label>
                        <br></br>
                        <label style={{ marginRight: '15px', width: '100%' }}>
                            Project Status
                            <br></br>
                            <br></br>
                            <Select value = {this.state.selectedOption} onChange = {this.handleChange.bind(this)} options = {this.statusOptions}>
                            </Select>
                        </label>

                        <br></br>
                        <br></br>
                        <input type="submit" value="Submit" />

                    </form>
                </Modal>
                <ReactNotification ref={this.notificationDOMRef} />

                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onCellValueChanged={this.addUpdatedRow.bind(this)}
                    onCellDoubleClicked={this.displayComment.bind(this)}
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
                <button style={{ height: '30px', width: '100px', marginRight: '10px', marginTop: '8px', marginLeft: '8px' }} onClick={this.submitAddOneWeek.bind(this)}>+ Week</button>

                <button style={{ height: '30px', width: '100px', marginRight: '10px', marginTop: '8px', marginLeft: '8px' }} onClick={this.submitDeleteLastWeek.bind(this)}>- Week</button>

                {/*<div style = {{width: '200px', float :'right', marginTop: '8px', marginLeft: '8px'}}>*/}
                {/*    <Select value = {this.state.selectedOption} onChange = {this.handleChange.bind(this)} options = {this.statusOptions}>*/}
                {/*    </Select>*/}
                {/*</div>*/}

                <button style={{ height: '30px', width: '100px', marginRight: '15px', marginTop: '8px', marginLeft: '8px'}} onClick = {this.addOldWeek.bind(this)}
                >
                    See Old Week
                </button>

                {/*<p style = {{float :'right', 'marginTop' : '7px', 'marginRight' : '10px', "font-size" : '15px'}}><b>Project Status</b></p>*/}

                <button style={{ height: '30px', width: '100px', marginRight: '15px', marginTop: '8px', marginLeft: '8px'}} onClick = {this.openProjectForm.bind(this)}
                >
                    Edit Project
                </button>

                <button style={{ height: '30px', width: '100px', marginRight: '15px', marginTop: '8px', marginLeft: '8px'}} onClick = {this.openCommentViewModal.bind(this)}
                >
                    Edit Comment
                </button>

                <Link to={addResPageUrl}>Add Resource</Link>
            </div>
        );
    }
}

export default Individual_project_page