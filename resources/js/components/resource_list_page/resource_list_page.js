import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Modal from 'react-responsive-modal';

class Resource_list_page extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPopup: false,
			columnDefs: [{
				headerName: "Name", field: "name"
			}],
			// state variables needed for resource form
			rowData: [],
			firstName: '',
			lastName: '',
			netID: '',
			maxHourPerWeek: 0
		};

		this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
		this.handleLastNameChange = this.handleLastNameChange.bind(this);
		this.handleNetIDChange = this.handleNetIDChange.bind(this);
		this.handleMaxHourChange = this.handleMaxHourChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	togglePopup() {
		this.setState({
			showPopup: !this.state.showPopup
		});
	}

	// cellClicked(event) {
	// 	if (event.value == undefined) {
	// 		console.log("undefined");
	// 	}
	// }

	async processData(data) {

		let columnDefs = [
			{ headerName: 'NetID', field: 'netid', filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left' },
			{ headerName: 'Name', field: 'name',filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left'  },
			{ headerName: 'Max Hour Per Week', field: 'maxHourPerWeek',filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left'  },
			{ headerName: 'Details', field: 'detailLink',filter: "agTextColumnFilter", suppressMovable: true, pinned: 'left',  cellRenderer: function(params) {
				console.log(params.value);
      	// return '<a href="https://www.google.com" target="_blank">'+ params.value+'</a>'
				return "<a href='/individual_resource/" + params.value +"'>Details</a>"
  		}}
		]

		let rowData = [];
		let currJSON = {};
		let colNames = new Set();
		let prevNetId = null;

		for (let i = 0; i < data.length; i++) {
			let curr = data[i];
			let currID = curr.NetID;
			let currHeader = curr.Dates;
			let fullName = curr.FirstName + " " + curr.LastName;
			let maxHour = curr.MaxHoursPerWeek;
			let id = curr.ResourceID;
			// console.log(id);

			if (currID != prevNetId) {
				if (prevNetId != null) {
					rowData.push(currJSON);
				}
				prevNetId = currID;
				currJSON = {
					netid: currID,
					name: fullName,
					maxHourPerWeek: maxHour,
					detailLink: id
				};
			}
			let currHours = curr.TotalHoursPerWeek;
			if (!colNames.has(currHeader)) {
				colNames.add(currHeader);
				let newColDef = {
					headerName: currHeader,
					field: currHeader,
					sortable: true,
					filter: "agTextColumnFilter",
					suppressMovable: true
				};
				columnDefs.push(newColDef);
			}
			currJSON[currHeader] = currHours;
		}
		rowData.push(currJSON);
		return { "rowData": rowData, "columnDefs": columnDefs };
	}

	componentDidMount() {
		// fetch('../api/displayAllResources')
		// 	.then(result => result.json())
		// 	.then(data => this.processData(data))
		// 	.then(function (newData) {
		// 		this.setState({ rowData: newData["rowData"], columnDefs: newData["columnDefs"] })
		// 	}.bind(this));
		fetch('../api/displayResourceHours')
			.then(result => result.json())
			.then(data => this.processData(data))
			.then(function (newData) {
				this.setState({ rowData: newData["rowData"], columnDefs: newData["columnDefs"] })
			}.bind(this));
	}

	handleFirstNameChange(event) {
		this.setState({
			firstName: event.target.value
		});
	}

	handleLastNameChange(event) {
		this.setState({
			lastName: event.target.value
		});
	}

	handleNetIDChange(event) {
		this.setState({
			netID: event.target.value
		});
	}

	handleMaxHourChange(event) {
		this.setState({
			maxHourPerWeek: event.target.value
		});
	}

	async handleSubmit(event) {
		let data = {
			"NetID": this.state.netID,
			"FirstName": this.state.firstName,
			"LastName": this.state.lastName,
			"MaxHoursPerWeek": this.state.maxHourPerWeek
		}

		let response = await fetch('../api/addResource', {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
		});

		// fetch('../api/displayAllResources')
		// 	.then(result => result.json())
		// 	.then(data => this.processData(data))
		// 	.then(function (newData) {
		// 		this.setState({ rowData: newData["rowData"], columnDefs: newData["columnDefs"] })
		// 	}.bind(this));
	}

	render() {
		return (
			<div
				className="ag-theme-balham"
				style={{
					height: '62vh',
					width: '100vw'
				}}
			>
				<AgGridReact
					columnDefs={this.state.columnDefs}
					rowData={this.state.rowData}
					// onCellClicked={this.cellClicked.bind(this)}
				></AgGridReact>

				<Modal open={this.state.showPopup} onClose={this.togglePopup.bind(this)} center closeIconSize={14}>
					<h4 style={{ marginTop: '15px' }}>Add a New Resource</h4>
					<form onSubmit={this.handleSubmit}>
						<label style={{marginRight: '15px'}}>First Name:</label>
						<input style={{float: 'right'}} type="text" required value={this.state.firstName} onChange={this.handleFirstNameChange} />
						<br></br>
						<label style={{marginRight: '15px'}}>Last Name:</label>
						<input style={{float: 'right'}} type="text" required value={this.state.lastName} onChange={this.handleLastNameChange} />
						<br></br>
						<label style={{marginRight: '15px'}}>netID:</label>
						<input style={{float: 'right'}} type="text" required value={this.state.netID} onChange={this.handleNetIDChange} />
						<br></br>
						<label style={{marginRight: '15px'}}>Max hours per Week:</label>
						<input style={{float: 'right'}} type="number" required value={this.state.maxHourPerWeek} onChange={this.handleMaxHourChange} />
						<br></br>
						<input type="submit" value="Submit" />
					</form>
				</Modal>

				<button
					style={{ height: '30px', width: '100px', marginRight: '10px' }}
					onClick={this.togglePopup.bind(this)}
				>Add Resource</button>
			</div>
		);
	}
}

export default Resource_list_page

if (document.getElementById('resources')) {
	ReactDOM.render(<ResourceListPage />, document.getElementById('Resource_list_page'));
}
