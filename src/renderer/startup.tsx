import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { drawFlames } from './runes';


async function showLogo(base64: string): Promise<void> {
    const img = document.createElement('img') as HTMLImageElement;
    img.src = `data:image/png;base64,${base64}`;
    document.getElementById('logo').appendChild(img);
}

async function showTitleBox(base64: string): Promise<void> {
    document.getElementById('title-box').style.background = `url('data:image/png;base64,${base64}') no-repeat`;
}

async function showTitleButton(base64: string): Promise<void> {
    document.getElementById('title-button-1').style.background = `url('data:image/png;base64,${base64}') no-repeat`;
}

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
                    <div className="title-button" style={{
                        background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                    }}>Create an Account</div>
                    <div className="title-button" style={{
                        background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                    }}>Play Game</div>
                </div>
            </div>
        );
    }

}
