import React, { Component } from 'react';
import Login from "./Login";
import Signup from "./Signup";

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'login',
            isPending: false
        };

        this.togglePending = this.togglePending.bind(this);
    }

    tabChange = (activeTab) => {
        if (!this.state.isPending) {
            this.setState({activeTab})
        }
    };

    setLogin = (user) => {
        this.props.login(user);
    };

    togglePending = () => {
        if (this.state.isPending) {
            this.setState({isPending: false})
        } else {
            this.setState({isPending: true})
        }
    };

    render() {
        let login_class, signup_class, content;

        if (this.state.activeTab === 'login') {
            login_class = 'login-active-tab';

            content = (
                <Login login={this.setLogin} togglePending={this.togglePending}/>
            );
        } else if (this.state.activeTab === 'signup') {
            signup_class = 'login-active-tab';

            content  = (
                <Signup login={this.setLogin} togglePending={this.togglePending}/>
            )
        }

        return (
            <div className={'login center-it'}>
                <div>
                    <div className={login_class} onClick={() => this.tabChange('login')}>
                        Login
                    </div>
                    <div className={signup_class} onClick={() => this.tabChange('signup')}>
                        Signup
                    </div>
                </div>
                {content}
            </div>
        )

    }
}

export default User;