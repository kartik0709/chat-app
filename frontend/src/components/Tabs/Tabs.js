import React, {PureComponent} from 'react';
import Tab from './Tab';
import Back from '../../images/back.svg';
import Search from '../../images/search.svg';
import Send from '../../images/send.svg';
import io from 'socket.io-client';
import { Messages } from "./Messages";
import $ from 'jquery';
import * as config from '../../config';

class Tabs extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '',
            tabList: [],
            message: '',
            socket: null,
            chats: {},
            filter: ''
        };

        this.initSocket = this.initSocket.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.checkKey = this.checkKey.bind(this);
        this.updateFilter = this.updateFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.onFilterBlur = this.onFilterBlur.bind(this);
    }

    componentDidMount() {
        this.initSocket();
    }

    // initialises socket.io
    initSocket = () => {
        const self = this;
        const { id } = this.props;
        // send username when joining the server
        const socket = io(config.API_ENDPOINT, {query: {username: id}});
        socket.on('connect', () => {
            console.log('connected');
        });

        this.setState({
            socket
        }, () => {
            // as soon as the state is set, SEND_LIST and ALL_CHATS signal is emitted to get the list of user and all of our chat history respectively
            this.state.socket.emit(config.SEND_LIST);
            this.state.socket.emit(config.ALL_CHATS, id);

            // On receiving the list of users, we remove our own username from the list
            this.state.socket.on(config.LIST, data => {
                let index = data.indexOf(id);
                if (index >= 0) {
                    data.splice(index, 1);
                    this.setState({tabList: data})
                }
            });


            // when someone sends us a message, we capture it in this function
            this.state.socket.on(config.UPDATE_CHAT, (data) => {
                let chats = Object.assign({}, self.state.chats);
                chats[data.chatName] = data.chats;


                // if the person's chat who sent the message is not open, show an asterisk
                if (data.chatName !== this.state.activeTab)  {
                    $(`#new-${data.chatName}`).show();
                }

                this.setState({
                    chats
                });


            });

            // to receiving our entire chat history
            this.state.socket.on(config.ALL_CHATS, (data) => {
                this.setState({
                    chats: data
                })
            });
        });
    };

    // trim the message as we don't want to send out empty spaces
    // send out PRIVATE_CHAT signal to send our messages to the user
    sendMessage = () => {
        if (this.state.message.trim().length === 0) {
            return;
        }
        let {activeTab} = this.state;
        let {id} = this.props;
        let message = {
            sender: id,
            message: this.state.message.trim()
        };

        let chats = Object.assign({}, this.state.chats);
        if (activeTab in chats) {
            chats[activeTab].push(message);
        } else {
            chats[activeTab] = [message];
        }

        this.setState({
            chats,
            message: ''
        }, () => {
            $('#send-img').hide();
            this.scrollToBottom()
        });

        this.state.socket.emit(config.SEND_PRIVATE, {
            sender: id,
            receiver: activeTab,
            message
        });
    };

    // function to change active user chat
    changeTab = (activeTab) => {
        $(`#new-${activeTab}`).hide();
        this.setState({activeTab}, () => {
            this.scrollToBottom();
        });
    };

    // we don't trim the message then set it on the state as we don't want to interrupt with the flow of user typing
    updateMessage = (e) => {
        if (e.target.value.length > 500) {
            return;
        } else if (e.target.value.length !== 0) {
            $('#send-img').show();
        } else {
            $('#send-img').hide();
        }
        this.setState({message: e.target.value})
    };

    // updates filter
    // we don't trim the filter then set it on the state as we don't want to interrupt with the flow of user typing
    updateFilter = (e) => {
        if (e.target.value.left > 10) {
            return;
        }

        this.setState({
            filter: e.target.value
        });
    };

    // simple function to hide image
    onFilterFocus = () => {
        $('#search-img').hide();
        $('#back').show();
    };

    // simple function to show and hide image based on filter text
    onFilterBlur = () => {
        if (this.state.filter.length === 0) {
            $('#search-img').show();
            $('#back').hide();
        }
    };

    // function clear the filter
    clearFilter = () => {
        $('#search-img').show();
        $('#back').hide();
        this.setState({
            filter: ''
        });
    };

    // makes sure that on enter, the chat message is sent
    checkKey = (e) => {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    };

    // function is called everytime we send a new message or open a chat to make sure that user is always at the bottom, where latest message is.
    scrollToBottom = () => {
        let height = 0;
        $('div.thread-container div').each(function(i, value){
            height += parseInt($(this).height());
        });

        height += '';

        $('.thread-container').animate({scrollTop: height}, 0);
    };

    // logout user
    logoutUser = () => {
        this.props.logout();
    };

    render() {
        let {activeTab, chats, tabList, filter} = this.state;
        let list;

        // filters list of user based on filter text
        if (filter) {
            list = tabList.filter((item)=>{
                return item.toLowerCase().indexOf(filter.toLowerCase()) !== -1
            });
        } else {
            list = tabList
        }

        let content;
        if (activeTab) {
            content = (
                <div className={'content-holder'}>
                    <div className={'thread-heading'}>
                        <p>Chatting with {activeTab}</p>
                    </div>
                    <div className={'thread-wrapper'}>
                        <Messages id={this.props.id} messages={chats[activeTab] ? chats[activeTab] : []}/>
                    </div>
                    <div className={'send-msg-holder'}>
                        <div className={'to-right'}>
                            <input className={'send-msg'} type={'text'} onChange={this.updateMessage} value={this.state.message} spellCheck={false} maxLength={config.MESSAGE_MAX_LENGTH} onKeyPress={this.checkKey}/>
                            <img id={'send-img'} src={Send} alt={'send'} style={{cursor: 'pointer', display: 'none'}} onClick={this.sendMessage}/>
                        </div>
                    </div>
                </div>
            );
        } else {
            content = (
                <div className={'content-holder'}>
                    <div className={'cheeky-cheeky'}>
                        <p>Time to ditch whatsapp 😉</p>
                        <span>Select a chat.....to chat!</span>
                    </div>
                </div>
            )
        }
        return (
            <div className={'i-holder'}>
                <div>
                    <div className={'search'}>
                        <div className={'to-left'}>
                            <input type={'text'} className={'search-input'} placeholder={'Search for a chat...'} onFocus={this.onFilterFocus} spellCheck={false} onBlur={this.onFilterBlur} onChange={this.updateFilter} value={this.state.filter} maxLength={config.MAX_LENGTH}/>
                            <img id={'back'} src={Back} alt={'back'} onClick={this.clearFilter} style={{display: 'none', cursor: 'pointer'}}/>
                            <img src={Search} alt={'search'} id={'search-img'}/>
                        </div>
                    </div>
                    <div className={'chat-wrapper'}>
                        <div className={'chat-holder'}>
                            {list.map((item) => <Tab key={item} name={item} activeTab={this.state.activeTab} onClick={() => this.changeTab(item)}/>)}
                        </div>
                    </div>
                    <div className={'logout'}>
                        <button onClick={this.logoutUser}>Logout</button>
                    </div>
                </div>
                {content}
            </div>
        )
    }
}

export default Tabs;