import React, { Component } from 'react';
import $ from 'jquery';
import axios from 'axios';
import * as config from '../../config';
import User from "../../images/user.svg";
import Key from "../../images/key.svg";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: ''
        };

        this.setField  = this.setField.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.fieldBlur = this.fieldBlur.bind(this);
    }

    // to map the value of both username and password fields to state
    setField = (e) => {
        if (e.target.value > config.MAX_LENGTH) {
            return;
        }

        this.setState({
            [e.target.name]: e.target.value
        });
    };

    // on focus of fields, what to do
    fieldFocus = (name) => {
        $('#submit-error').css('opacity', '0');
        $(`#${name}`).removeClass();
        $(`#${name}`).focus();
        $(`#correct-${name}`).animate({
            opacity: '0',
            minWidth: '0'
        });
        $(`#error-${name}`).animate({
            opacity: '0',
            minWidth: '0'
        });
        $(`#msg-${name}`).hide();
    };

    // on blur of field, what to do
    fieldBlur = (name) => {
        if (name === 'user') {
            if (this.state.username.length < config.MIN_LENGTH) {
                $('#error-user').animate({
                    opacity: '1',
                    minWidth: '50px'
                }, "fast");
                $('#user').addClass('error');
                $('#msg-user').text('Must be atleast 4 characters');
                $('#msg-user').show();
            } else if (this.state.username.includes(' ')) {
                $('#error-user').animate({
                    opacity: '1',
                    minWidth: '50px'
                }, "fast");
                $('#user').addClass('error');
                $('#msg-user').text('Cannot contain spaces');

                $('#msg-user').show();
            } else {
                $('#correct-user').animate({
                    opacity: '1',
                    minWidth: '50px'
                }, "fast");
                $('#user').addClass('correct');
            }
        } else {
            if (this.state.password.length < config.MIN_LENGTH) {
                $('#error-key').animate({
                    opacity: '1',
                    minWidth: '50px'
                }, "fast");
                $('#key').addClass('error');
                $('#msg-key').show();
            } else {
                $('#correct-key').animate({
                    opacity: '1',
                    minWidth: '50px'
                }, "fast");
                $('#key').addClass('correct');
            }
        }

        // visually enables/disables submit button
        if (this.state.username.length >= config.MIN_LENGTH && this.state.password.length >= config.MIN_LENGTH && !this.state.username.includes(' ')) {
            $('#submit').css('opacity', '1');
        } else {
            $('#submit').css('opacity', '.6');
        }
    };

    // sends api request to check whether password and username combination is correct or not
    // setTimeout function at various points is just to stimulate a real server request and show animations
    loginUser = () => {
        if (this.state.username.length < config.MIN_LENGTH || this.state.password.length < config.MIN_LENGTH || this.state.username.includes(' ')) {
            return
        }
        const self = this;
        let { username, password} = this.state;
        this.props.togglePending();
        $('#user').attr('disabled', true);
        $('#key').attr('disabled', true);
        $('#submit-text').hide();
        $('#submit-error').css('opacity', '0');
        $('#submit').prop('disabled', 'true').animate({
            minWidth: '50px',
            maxWidth: '50px'
        }, 300, function() {
            $('#loader').show();
            setTimeout(function() {
                axios.post(`${config.API_ENDPOINT}/api/login`, {
                    username,
                    password
                }).then((result) => {
                    if (result.status === config.STATUS_OKAY) {
                        $('#loader').hide();
                        $('#submit').css('background', 'rgb(0,255,127').animate({
                            minWidth: '125px',
                            maxWidth: '125px'
                        }, 500, function () {
                            $('#submit-text').text('Success').show();
                            setTimeout(function () {
                                self.props.login(username);
                            }, 200);
                        })
                    }
                }).catch(() => {
                    self.props.togglePending();
                    $('#loader').hide();
                    $('#submit').css('background', 'red').animate({
                        minWidth: '220px',
                        maxWidth: '220px'
                    }, 200, function () {
                        $('#submit-text').show();
                        $('#user').attr('disabled', false);
                        $('#key').attr('disabled', false);
                        $('#submit').prop('disabled', false);

                        // display error message and also on respective fields
                        $('#submit-error').css('opacity', '1');
                        $('#error-user').animate({
                            opacity: '1',
                            minWidth: '50px'
                        }, "fast");
                        $('#user').addClass('error');
                        $('#error-key').animate({
                            opacity: '1',
                            minWidth: '50px'
                        }, "fast");
                        $('#key').addClass('error');
                    });
                })
            }, 500);
        });
    };

    render() {
        let {username, password} = this.state;

        return (
            <div>
                <div style={{position: 'relative', marginBottom: '30px'}}>
                    <input id={'user'} name={'username'} placeholder={'username'} type={'text'} onChange={this.setField} value={username}  spellCheck={false} onFocus={() => this.fieldFocus('user')} onBlur={() => this.fieldBlur('user')} maxLength={config.MAX_LENGTH}/>
                    <img className={'user'} src={User} alt={'user'} style={{maxHeight: '20px'}}/>
                    <span id="msg-user" className={'error-msg'} onClick={() => this.fieldFocus('user')}>Must be atleast 4 chararacters</span>
                    <div id="correct-user" className={'correct-user'}></div>
                    <div id="error-user" className={'error-user'}></div>
                </div>
                <div style={{position: 'relative'}}>
                    <input id={'key'} name={'password'} placeholder={'password'} type={'password'} onChange={this.setField} value={password} spellCheck={false} onFocus={() => this.fieldFocus('key')} onBlur={() => this.fieldBlur('key')} maxLength={config.MAX_LENGTH}/>
                    <img className={'user'} src={Key} alt={'pass'} style={{maxHeight: '16px'}}/>
                    <span id="msg-key" className={'error-msg'} onClick={() => this.fieldFocus('key')}>Must be atleast 4 chararacters</span>
                    <div id="correct-key" className={'correct-user'}></div>
                    <div id="error-key" className={'error-user'}></div>
                </div>
                <span id={'submit-error'} className={'submit-error'}>Invalid username/password</span>
                <button id="submit" className={'submit-btn'} onClick={this.loginUser} style={{opacity: .6}}>
                    <p id="submit-text">Login</p>
                    <div id="loader" className="loader"></div>
                </button>
            </div>
        )
    }
}

export default Login;
