import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Individual_project_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.createState();
    }

    createState() {
        const componentReference = this.ref;
        return {
            gridOptions: {
                columnDefs: [
                    {headerName: 'Make', field: 'make', editable: true, sortable: true, enableCellChangeFlash:true},
                    {headerName: 'Model', field: 'model', editable: true, sortable: true, enableCellChangeFlash:true},
                    {headerName: 'Price', field: 'price', editable: true, sortable: true, enableCellChangeFlash:true}

                ],
                    rowData: [
                    {make: 'Toyota', model: 'Celica', price: 35000},
                    {make: 'Ford', model: 'Mondeo', price: 32000},
                    {make: 'Porsche', model: 'Boxter', price: 72000},
                    {make: 'Honda', model: 'Element', price: 90000},
                    {make: 'Panda', model: 'Express', price: 100000},
                    {make: 'BMW', model: 'X5', price: 75000}
                ]
            }
        }
    }
    /***
     * Make API Calls here to fetch data and set the row data appropriately
     */
    componentDidMount() {
        const projectID = this.props.match.params.projectID;

        fetch('../api/displaySchedules') // <-- this path surprises me
            .then(response => response.json())
            .then(data => console.log(data));
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{ height: '200px', width: '600px' }}
            >
                <AgGridReact
                    gridOptions={this.state.gridOptions}
                    onCellEditingStopped={function(e) {
                        console.log("");
                    }}
                >
                </AgGridReact>
            </div>
        );
    }
}

export default Individual_project_page