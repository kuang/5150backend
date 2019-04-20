import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import './popup.css'

// const Resource_list_page = () => (
// 	<h2>Resource List Page</h2>
// )
class Popup extends React.Component {
	render() {
		return (
			<div className='popup'>
				<div className='popup_inner'>
					<h1>{this.props.text}</h1>
					<button onClick={this.props.closePopup}>Cancel</button>
				</div>
			</div>
		);
	}
}

class Resource_list_page extends React.Component {
	constructor(props) {
		super(props);
		this.state =  {
			showPopup: false,
			columnDefs: [{
				headerName: "Name", field: "name"
			}],
			rowData: []
		}
	}

	togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup
    });
  }

	async processData(data) {
		console.log(data);
		let columnDefs = [
			{headerName: 'NetID', field: 'netid'},
			{headerName: 'Name', field: 'name'},
			{headerName: 'Max Hour Per Week', field: 'maxHourPerWeek'}
		]

		let rowData = [];
		let currJSON = {};
		// let prevNetID = null;
		for (let i=0; i<data.length; i++) {
			let curr = data[i];
			let currID = curr.NetID;
			let fullName = curr.FirstName + " " + curr.LastName;
			let maxHour = curr.MaxHoursPerWeek; 

			currJSON = {netid: currID, name : fullName,  maxHourPerWeek: maxHour};
			rowData.push(currJSON);

			// console.log(currID);
		}
		console.log(rowData);
		return {"rowData" : rowData, "columnDefs" : columnDefs};
	}

	componentDidMount() {
		fetch(`../api/displayAllResources`)
			.then(result => result.json())
			.then(data => this.processData(data))
			.then(function(newData) {
				this.setState({rowData: newData["rowData"], columnDefs: newData["columnDefs"]})
			}.bind(this))
	}

	render() {
		return (
      <div
        className="ag-theme-balham"
        style={{
          height: '70vh',
          width: '600px'
        }}
      >

	      <AgGridReact
	        columnDefs={this.state.columnDefs}
	        rowData={this.state.rowData}
	      >
	      </AgGridReact>

	      <button
	      	style={{height:'30px', width:'100px', marginRight: '10px'}}
	      	onClick={this.togglePopup.bind(this)}
	      >Add</button>
	      {
	      	this.state.showPopup ?
	      	<Popup
	      		text='This will be a form'
	      		closePopup={this.togglePopup.bind(this)}
	      	/> : null
	      }
			</div>
    );
	}
}

export default Resource_list_page