import React, {PureComponent} from 'react';

class Tab extends PureComponent {
    constructor(props) {
        super(props);

        this.clicked = this.clicked.bind(this);
    }

    clicked = () => {
        this.props.onClick();
    };

    render() {
        let {name, activeTab} = this.props;
        let classActive = '';

        if (name === activeTab) {
            classActive = 'chat-active'
        } else {
            classActive = ''
        }

        return (
            <p className={classActive} onClick={this.clicked}>
                {name}
                <span id={`new-${name}`} style={{display:'none', color: 'red'}}>*</span>
            </p>
        )
    }
}

export default Tab;