import React, { Component } from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';
import User from "./components/User/User";
import Tabs from "./components/Tabs/Tabs";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuthenticated: false,
            username: ''
        };

        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
    }

    // function to set username, it is passed on to both signup and login
    loginUser = (username) => {
        this.setState({
            isAuthenticated: true,
            username: username
        })
    };


    // function to logout, it is passed on to tabs
    logoutUser = () => {
        this.setState({
            isAuthenticated: false,
            username: ''
        })
    };

    render() {
        const { isAuthenticated, username } = this.state;
        const userLinks = (
            <Switch>
                <Route path={'/chat'} component={() => <Tabs logout={this.logoutUser} id={username}/>} exact/>
                <Redirect from={'*'} to={'/chat'}/>
            </Switch>
        );

        const guestLinks = (
            <Switch>
                <Route path={'/'} component={() => <User login={this.loginUser}/>} exact/>
                <Redirect from={'*'} to={'/'}/>
            </Switch>
        );

        return (
            <BrowserRouter>
                <section>
                    {isAuthenticated ? userLinks : guestLinks}
                </section>
            </BrowserRouter>
        );
    }
}

export default App;
