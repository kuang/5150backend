import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Modal from 'react-responsive-modal';
import { LoginContext } from '../App';

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                {
                    headerName: 'Project',
                    field: 'projectName',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true,
                    pinned: "left"
                }, {
                    headerName: 'Details',
                    field: 'details',
                    width: 100,
                    filter: "agTextColumnFilter",
                    suppressMovable: true,
                    pinned: 'left',
                    cellRenderer: function (params) {
                        return "<a href='/individual_project/" + params.value + "'>Details</a>"
                    }
                },
                // { headerName: 'Most Recent Updates', field: 'updates'},
                {
                    headerName: 'Start Date',
                    field: 'startDate',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                }, {
                    headerName: 'Due Date',
                    field: 'dueDate',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                }, {
                    headerName: 'Status',
                    field: 'status',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                }, {
                    headerName: 'Technology',
                    field: 'tech',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                },
                // { 
                //     headerName: 'Assigned Resources', 
                //     field: 'resources', 
                //     sortable: true, 
                //     filter: "agTextColumnFilter",
                //     suppressMovable: true
                // },
                // { 
                //     headerName: 'Hours This Week', 
                //     field: 'hoursWeek', 
                //     sortable: true, 
                //     filter: "agTextColumnFilter",
                //     suppressMovable: true
                // },
                {
                    headerName: 'Initial Estimated Hours',
                    field: 'estMaxHours',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                }, {
                    headerName: 'Total Hours',
                    field: 'hoursTotal',
                    sortable: true,
                    filter: "agTextColumnFilter",
                    suppressMovable: true
                }
            ],
            rowData: [],

            // Modal for adding new project modal
            showPopup: false,
            newProjectName: "",
            newTechnology: "",
            newEstMaxHours: "",
            newStatus: "Ongoing",
            newStartDate: "",
            newDueDate: "",
        };
        // handlers for adding new prject modal
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSetProjName = this.handleSetProjName.bind(this);
        this.handleSetTech = this.handleSetTech.bind(this);
        this.handleSetHours = this.handleSetHours.bind(this);
        this.handleSetStartDate = this.handleSetStartDate.bind(this);
        this.handleSetDueDate = this.handleSetDueDate.bind(this);
    }

    /** Returns a concatenated string of a list of the first names of the resources
     *  associated with a particular project with [projectID]
     */
    // async getResourceNames(projectID) {
    //     // need to access ResourcesPerProject table,
    //     // then find all ResourceID's that matches with the ProjectID,
    //     // then access Resources table and use the list of ResourceID's to find their names
    //     return fetch(`../api/displayResourcesPerProject/${projectID}`)
    //         .then(function (response) {
    //             return response.json();
    //         })
    //         .then(function (myJSON) {
    //             if (myJSON === undefined || myJSON.length == 0) {
    //                 return "N/A";
    //             } else {
    //                 var names = myJSON.map(function (a) { return a.FirstName; });
    //                 names = names.join(", ");
    //                 return names
    //                 }
    //         });
    // }

    /** Returns the hours per week assgined to this project [projectID] */
    // async getHoursWeek(projectID) {
    //     // get an array of [ScheduleID] that are matched with [projectID];
    //     // check the current Date;
    //     // for all Schedules with [Dates] in same week as the current Date, 
    //     // sum their values of [HoursPerWeek]

    //     // projectID = 25
    //     const todayDate = new Date();
    //     const scheduleIDArr = 
    //         await fetch(`../api/displayResourcesPerProject/`)
    //         .then(function(response) {
    //             return response.json()
    //         })
    //         .then(function(myJSON) {
    //             if (myJSON === undefined || myJSON.length == 0) {
    //                 return [];
    //             } else {
    //                 var result = myJSON.filter(function(obj) {
    //                     return obj.ProjectID === projectID;
    //                 })
    //                 console.log(result);
    //                 var scheduleIDs = result.map(function (a) { return a.ScheduleID; });
    //                 console.log(scheduleIDs);
    //                 return scheduleIDs;
    //             }
    //         });

    //     if (scheduleIDArr.length == 0) {
    //         return 0; // no schedule <=> zero hour assigned
    //     } 
    //     var validSchedules = 
    //         await fetch(`../api/displaySchedules/`)
    //         .then(function (response) {
    //             return response.json()
    //         })
    //         .then(function (myJSON) {
    //             if (myJSON === undefined || myJSON.length === 0) {
    //                 return [];
    //             } else {
    //                 // get all schedules in scheduleIDArr
    //                 var validschedules = myJSON.filter(function (obj) {
    //                     return !(scheduleIDArr.indexOf(obj.ScheduleID) === -1);
    //                 });
    //                 console.log(validschedules);
    //                 return validschedules;
    //             }
    //         });


    //     if (validSchedules.length === 0) {
    //         return 0;
    //     }

    //     /** Compares two dates and return true if they are in same week and false otherwise
    //     *  [anyDate] can be any Date object, but [weekDate] must be a Monday
    //     */
    //     let isInSameWeek = function(anyDate, weekDate) {
    //         var lowerbound = new Date(weekDate + "EST");
    //         var upperbound = new Date(lowerbound.getTime());
    //         upperbound.setDate(upperbound.getDate() + 7);
    //         if (lowerbound <= anyDate && anyDate < upperbound) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     };
    //     // filter again with respect to date
    //     validSchedules = validSchedules.filter(function (obj) {
    //         return isInSameWeek(todayDate, obj.Dates);
    //     })
    //     console.log(validSchedules);

    //     var hoursArr = validSchedules.map(function (a) { return a.HoursPerWeek; });
    //     console.log(hoursArr);

    //     if (hoursArr.length === 0) {
    //         return 0;
    //     } else {
    //         var totalHours = hoursArr.reduce((acc, a) => acc + a);
    //         return totalHours;
    //     }
    // }

    async processData(data) {
        var rowData = [];
        var rowJSON = {};
        for (let i = 0; i < data.length; i++) {
            let currJSON = data[i];
            let currProjectID = currJSON.ProjectID;
            let currProjectName = currJSON.ProjectName;
            let currStatus = currJSON.Status;
            let currTech = currJSON.Technology;
            let currStartDate = currJSON.StartDate;
            let currDueDate = currJSON.DueDate;
            let currEstMaxHours = currJSON.EstMaxHours;
            let currHoursTotal = currJSON.TotalHoursAssigned;
            //let currResources = await this.getResourceNames(currProjectID);
            //let currHoursWeek = await this.getHoursWeek(currProjectID);
            //let currUpdates = "";

            rowJSON = {
                projectName: currProjectName,
                details: currProjectID,
                //updates: currUpdates,
                startDate: currStartDate,
                dueDate: currDueDate,
                status: currStatus,
                tech: currTech,
                //resources: currResources,
                //hoursWeek : currHoursWeek,
                estMaxHours: currEstMaxHours,
                hoursTotal: currHoursTotal
            };

            rowData.push(rowJSON);
        }

        return rowData
    }

    /* Methods for the adding project modal */
    togglePopup() {
        this.setState({
            showPopup: !(this.state.showPopup)
        });
    }

    handleSetProjName(event) {
        this.setState({
            newProjectName: event.target.value
        });
    }

    handleSetTech(event) {
        this.setState({
            newTechnology: event.target.value
        });
    }

    handleSetHours(event) {
        this.setState({
            newEstMaxHours: event.target.value
        });
    }

    handleSetStartDate(event) {
        this.setState({
            newStartDate: event.target.value
        });
    }

    handleSetDueDate(event) {
        this.setState({
            newDueDate: event.target.value
        });
    }

    async handleSubmit(event) {
        let newProjData = {
            "ProjectName": this.state.newProjectName,
            "Technology": this.state.newTechnology,
            "EstMaxHours": this.state.newEstMaxHours,
            "Status": this.state.newStatus,
            "StartDate": this.state.newStartDate,
            "DueDate": this.state.newDueDate
        }
        let response = await fetch(`../api/addProject`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProjData),
        });
    }
    /* Methods for the adding project modal */

    componentDidMount() {
        fetch(`../api/displayAllProjectInfo`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function (newData) {
                this.setState({ rowData: newData })
            }.bind(this))
    }

    buttonGenerater() {
        let value = window.sessionStorage.getItem("value");
        if (value === "logged") {
            return (<button
                style={{ height: '30px', width: '100px', marginRight: '10px' }}
                onClick={this.togglePopup.bind(this)}
            >Add Project</button>)
        }
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '65vh',
                    width: '1500px'
                }}
            >

                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                >
                </AgGridReact>

                <Modal open={this.state.showPopup} onClose={this.togglePopup.bind(this)} center closeIconSize={14}>
                    <h4 style={{ marginTop: '15px' }}>Adding a New Project</h4>
                    <form onSubmit={this.handleSubmit}>
                        <label style={{ marginRight: '15px' }}>Project Name:</label>
                        <input style={{ float: 'right' }} type="text" required value={this.state.newProjectName} onChange={this.handleSetProjName} />
                        <br></br>
                        <label style={{ marginRight: '15px' }}>Technology:</label>
                        <input style={{ float: 'right' }} type="text" required value={this.state.newTechnology} onChange={this.handleSetTech} />
                        <br></br>
                        <label style={{ marginRight: '15px' }}>Estimated Maximum Hours for This Project:</label>
                        <input style={{ float: 'right' }} type="number" required value={this.state.newEstMaxHours} onChange={this.handleSetHours} />
                        <br></br>
                        <label style={{ marginRight: '15px' }}>Start Date:</label>
                        <input style={{ float: 'right' }} type="date" required value={this.state.newStartDate} onChange={this.handleSetStartDate} />
                        <br></br>
                        <label style={{ marginRight: '15px' }}>Due Date:</label>
                        <input style={{ float: 'right' }} type="date" required value={this.state.newDueDate} onChange={this.handleSetDueDate} />
                        <br></br>
                        <input type="submit" value="Submit" />
                    </form>
                </Modal>
                {(this.buttonGenerater())}
                {/* <button
                    style={{ height: '30px', width: '100px', marginRight: '10px' }}
                    onClick={this.togglePopup.bind(this)}
                >Add Project</button> */}
            </div>
        );
    }
}

export default Projects_list_page