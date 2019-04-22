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
                    return "N/A";
                } else {
                    var names = myJSON.map(function (a) { return a.FirstName; });
                    names = names.join(", ");
                    return names
                    }
            });
    }

    /** Returns the hours per week assgined to this project [projectID] */
    async getHoursWeek(projectID) {
        // get an array of [ScheduleID] that are matched with [projectID];
        // check the current Date;
        // for all Schedules with [Dates] in same week as the current Date, 
        // sum their values of [HoursPerWeek]
        
        // projectID = 25
        const todayDate = new Date();
        const scheduleIDArr = 
            await fetch(`../api/displayResourcesPerProject/`)
            .then(function(response) {
                return response.json()
            })
            .then(function(myJSON) {
                if (myJSON === undefined || myJSON.length == 0) {
                    return [];
                } else {
                    var result = myJSON.filter(function(obj) {
                        return obj.ProjectID === projectID;
                    })
                    console.log(result);
                    var scheduleIDs = result.map(function (a) { return a.ScheduleID; });
                    console.log(scheduleIDs);
                    return scheduleIDs;
                }
            });
        
        if (scheduleIDArr.length == 0) {
            return 0; // no schedule <=> zero hour assigned
        } 
        // scheduleIDArr = [15, 23, 24, 25, 26]
        var validSchedules = 
            await fetch(`../api/displaySchedules/`)
            .then(function (response) {
                return response.json()
            })
            .then(function (myJSON) {
                if (myJSON === undefined || myJSON.length === 0) {
                    return [];
                } else {
                    // get all schedules in scheduleIDArr
                    var validschedules = myJSON.filter(function (obj) {
                        return !(scheduleIDArr.indexOf(obj.ScheduleID) === -1);
                    });
                    console.log(validschedules);
                    return validschedules;
                }
            });

        
        if (validSchedules.length === 0) {
            return 0;
        }

        /** Compares two dates and return true if they are in same week and false otherwise
        *  [anyDate] can be any Date object, but [weekDate] must be a Monday
        */
        let isInSameWeek = function(anyDate, weekDate) {
            var lowerbound = new Date(weekDate + "EST");
            var upperbound = new Date(lowerbound.getTime());
            upperbound.setDate(upperbound.getDate() + 7);
            if (lowerbound <= anyDate && anyDate < upperbound) {
                return true;
            } else {
                return false;
            }
        };
        // filter again with respect to date
        validSchedules = validSchedules.filter(function (obj) {
            return isInSameWeek(todayDate, obj.Dates);
        })
        console.log(validSchedules);
        
        var hoursArr = validSchedules.map(function (a) { return a.HoursPerWeek; });
        console.log(hoursArr);

        if (hoursArr.length === 0) {
            return 0;
        } else {
            var totalHours = hoursArr.reduce((acc, a) => acc + a);
            return totalHours;
        }
    }

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
            let currHoursTotal= currJSON.EstMaxHours;
            let currResources = await this.getResourceNames(currProjectID);
            let currHoursWeek = await this.getHoursWeek(currProjectID);
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