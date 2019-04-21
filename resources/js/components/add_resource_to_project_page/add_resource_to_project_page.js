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

        this.handlePlus = this.handlePlus.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleSelectPlus = this.handleSelectPlus.bind(this);
        this.handleSelectRemove = this.handleSelectRemove.bind(this);
    }

    async processData(data, flag) {
        // console.log("adsfadfadfadfadf============================");
        // console.log(data);
        var dict = {};

        for (var i in data) {
            let id = data[i].NetID;
            dict[id] = data[i];
        }
        // console.log("+++++++++++++++++++++++++");
        // console.log(dict);
        if (flag == 0) {
            this.setState({ currentResources: dict });
        } else {
            this.setState({ avaliableResources: dict });
        }
    }

    componentDidMount() {
        let projectID = this.props.match.params.projectID;
        this.fetchResources(projectID);
        //fetch returns a promise
    }

    async fetchResources(projectID) {
        fetch(`../api/displayResourcesPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data, 0));

        fetch(`../api/displayResourcesAvailable/${projectID}`)
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
        // /addResourcePerProject
        for (var i = 0, len = this.state.toadd.length; i < len; i++) {
            let data = {
                "ProjectID": this.props.match.params.projectID,
                "NetID": this.state.toadd[i],
                "Role": "Prgrammer",
            };
            await fetch(`../api/addResourcePerProject`, {
                method: 'POST',
                headers: {
                    'Accepter': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }

        this.fetchResources(this.props.match.params.projectID);

        event.preventDefault();
    }

    handleRemove(event) {
        event.preventDefault();
    }

    render() {
        var leftList = this.renderList(this.state.avaliableResources);
        var rightList = this.renderList(this.state.currentResources);

        return (
            <div>
                <form onSubmit={this.handlePlus} id="addForm">
                    <select multiple id="addSelect" ref={this.Lref} onChange={this.handleSelectPlus}>
                        {leftList}
                    </select>
                    <input type="submit" value="ADD" className="addButton" />
                </form>

                <form onSubmit={this.handleRemove} id="removeForm">
                    <input type="submit" value="REMOVE" className="removeButton" />
                    <select multiple id="removeSelect" ref={this.Rref} onChange={this.handleSelectRemove}>
                        {rightList}
                    </select>
                </form>
            </div>
        );
    }

}

export default twoList


