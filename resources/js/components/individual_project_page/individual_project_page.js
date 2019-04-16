import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Individual_project_page extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                {headerName: 'Make', field: 'make'},
                {headerName: 'Model', field: 'model'},
                {headerName: 'Price', field: 'price'}

            ],
            rowData: [
                {make: 'Toyota', model: 'Celica', price: 35000},
                {make: 'Ford', model: 'Mondeo', price: 32000},
                {make: 'Porsche', model: 'Boxter', price: 72000}
            ]
        }
    }
    renderRow(name) {
        return (<h2>{name}</h2>);
    }

    renderGrid() {

    }

    render() {
        return (
            <ul class="list-unstyled">
                <li>{this.renderRow("SUP")}</li>
                <li>{this.renderRow("BOI")}</li>
            </ul>
        );
    }
}

export default Individual_project_page