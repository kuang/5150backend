import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

class twoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentResources: {},
            avaliableResources: {},
            toadd: [],
            toremove: []
        }
        this.Rref = React.createRef();
        this.Lref = React.createRef();
        this.projectID = this.props.match.params.projectID;

        this.handlePlus = this.handlePlus.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleSelectPlus = this.handleSelectPlus.bind(this);
        this.handleSelectRemove = this.handleSelectRemove.bind(this);
    }

    async processData(data, flag) {
        // console.log("adsfadfadfadfadf============================");
        // console.log(data);
        var dict = {};


        // console.log("+++++++++++++++++++++++++");
        // console.log(dict);
        if (flag == 0) {
            for (var i in data) {
                let id = data[i].NetID;
                dict[id] = data[i];
            }
            this.setState({ currentResources: dict });
        } else {
            for(var i in data) {
                let id = data[i].NetID;
                if(!(this.state.currentResources.hasOwnProperty(id))){
                    dict[id] = data[i]
                }
            }
            this.setState({ avaliableResources: dict });
        }
    }

    componentDidMount() {
        // let projectID = this.props.match.params.projectID;
        this.fetchResources(this.projectID);
        //fetch returns a promise
    }

    async fetchResources(projectID) {
        // fetch(`../api/displayProjectInfo/${projectID}`)
        //     .then(result => result.json())
        //     .then(data => console.log(data[0]));

        fetch(`../api/displayResourcesPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data, 0));

        fetch(`../api/displayAllResources`)
            .then(result => result.json())
            .then(data => this.processData(data, 1));

    }

    renderList(resDic) {
        var resources = Object.keys(resDic).map(function (key) {
            return resDic[key];
        });
        // console.log("------------------------");
        // console.log(resDic);

        var resourcesList = resources.map(function (resource) {
            return <option value={resource.NetID}>Name: {resource.FirstName} {resource.LastName} Role: {resource.Role}</option>
        });
        return resourcesList;
    }

    handleSelectPlus(event) {
        var tempEle = this.Lref.current;
        var opts = [], opt;
        for (var i = 0, len = tempEle.options.length; i < len; i++) {
            opt = tempEle.options[i];
            if (opt.selected) {
                opts.push(opt.value);
            }
        }
        this.state.toadd = opts;
        // console.log(this.state.toadd);
    }

    handleSelectRemove(event) {
        var tempEle = this.Rref.current;
        var opts = [], opt;
        for (var i = 0, len = tempEle.options.length; i < len; i++) {
            opt = tempEle.options[i];
            if (opt.selected) {
                opts.push(opt.value);
            }
        }
        this.state.toremove = opts;
        // console.log(this.state.toremove);
    }


    async handlePlus(event) {
        console.log(this.state.toadd);
        //addResourcePerProject
        for (var i = 0, len = this.state.toadd.length; i < len; i++) {
            let data = {
                "ProjectName": "P2",
                "NetID": this.state.toadd[i],
                "Role": "Prgrammer",
            };
            let response = await fetch(`../api/addResourcePerProject`, {
                method: 'POST',
                headers: {
                    'Accepter': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log(data);
        }


        this.fetchResources(this.props.match.params.projectID);

        event.preventDefault();
    }

    async handleRemove(event) {
        for (var i = 0, len = this.state.toremove.length; i < len; i++) {
            let data = {
                "ProjectName": "P2",
                "NetID": this.state.toremove[i],
            };
            let response = await fetch(`../api/deleteResourcePerProject`, {
                method: 'DELETE',
                headers: {
                    'Accepter': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log(data);
        }

        event.preventDefault();
    }

    render() {
        var leftList = this.renderList(this.state.avaliableResources);
        var rightList = this.renderList(this.state.currentResources);

        return (
            <div >
                <form onSubmit={this.handlePlus} id="addForm">
                    <select multiple id="addSelect" ref={this.Lref} onChange={this.handleSelectPlus}>
                        {leftList}
                    </select>
                    <input type="submit" value="ADD" className="addButton" />
                </form>

                <form onSubmit={this.handleRemove} id="removeForm">
                    <select multiple id="removeSelect" ref={this.Rref} onChange={this.handleSelectRemove}>
                        {rightList}
                    </select>
                    <input type="submit" value="REMOVE" className="removeButton" />
                </form>
            </div>
        );
    }

}

export default twoList

// if (document.getElementById('resources')) {
//     ReactDOM.render(<ResourceListPage />, document.getElementById('Resource_list_page'));
// }
