import React from 'react';

export const Messages = props => {
    return (
        <div className={'thread-container'}>
            <div style={{margin: 'auto'}}></div>
                {props.messages.map((msg) => {

                    // checks the sender, if it is the user logged in, aligns text to right, otherwise to left
                    if (msg.sender === props.id) {
                        return (
                            <div className={'thread-right'}>
                                <p>{msg.message}</p>
                            </div>
                        )
                    } else {
                        return (
                            <div>
                                <p>{msg.message}</p>
                            </div>
                        )
                    }
                })}
        </div>
    )
}