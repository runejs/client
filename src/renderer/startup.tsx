import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { drawFlames } from './runes';


type StartupState = {
    logoBase64: string;
    titleBoxBase64: string;
    titleButtonBase64: string;
}

export default class Startup extends Component<{}, StartupState> {

    componentWillMount() {
        this.setState({
            logoBase64: '',
            titleBoxBase64: '',
            titleButtonBase64: ''
        });

        ipcRenderer.on('synchronous-message', (event, args) => {
            if(args.type === 'runes') {
                drawFlames(args.runes, args.titlePixels);
            } else if(args.type === 'logo') {
                this.setState({
                    logoBase64: args.base64
                });
            } else if(args.type === 'titleBox') {
                this.setState({
                    titleBoxBase64: args.base64
                });
            } else if(args.type === 'titleButton') {
                this.setState({
                    titleButtonBase64: args.base64
                });
            }
        });
    }


    render() {
        return (
            <div id="startup">
                <div id="title-background">
                    <div id="title-background-left">&nbsp;</div>
                    <div id="title-background-right">&nbsp;</div>
                </div>

                <canvas id="runes-left" width="128" height="265"></canvas>
                <canvas id="runes-right" width="128" height="265"></canvas>

                <div id="logo">
                    <img src={ `data:image/png;base64,${this.state.logoBase64}` } />
                </div>

                <div id="title-box" style={{
                    background: `url('data:image/png;base64,${this.state.titleBoxBase64}')`
                }}>
                    <div id="welcome">
                        Welcome to RuneJS
                    </div>

                    <div id="title-button-container">
                        <div className="title-button" style={{
                            background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                        }}>New User</div>
                        <div className="title-button" style={{
                            background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                        }}>Existing User</div>
                    </div>
                </div>
            </div>
        );
    }

}
