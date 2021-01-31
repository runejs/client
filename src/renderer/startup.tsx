import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { drawFlames } from './runes';


type StartupState = {
    logoBase64: string;
    titleBoxBase64: string;
    titleButtonBase64: string;
    view: 'welcome' | 'existing_user' | 'new_user';
}

export default class Startup extends Component<{}, StartupState> {

    constructor(props) {
        super(props);

        this.openExistingUser = this.openExistingUser.bind(this);
        this.openNewUser = this.openNewUser.bind(this);
        this.back = this.back.bind(this);
    }

    componentWillMount(): void {
        this.setState({
            logoBase64: '',
            titleBoxBase64: '',
            titleButtonBase64: '',
            view: 'welcome'
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

    openExistingUser(): void {
        this.setState({ view: 'existing_user' });
    };

    openNewUser(): void {
        this.setState({ view: 'new_user' });
    };

    back(): void {
        this.setState({ view: 'welcome' });
    };

    render(): JSX.Element {
        if(!this.state.titleButtonBase64 || !this.state.titleBoxBase64) {
            return <></>;
        }

        const views: { [key: string]: JSX.Element } = {};

        views['welcome'] = <>
            <div id="welcome">
                Welcome to RuneJS
            </div>

            <div id="title-button-container">
                <div className="title-button" style={{
                    background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                }} onClick={this.openNewUser}>New User</div>
                <div className="title-button" style={{
                    background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                }} onClick={this.openExistingUser}>Existing User</div>
            </div>
        </>

        views['new_user'] = <>
            New User
        </>

        views['existing_user'] = <>
            <div id="existing-user">
                Enter your username &amp; password.
            </div>

            <form id="credentials">
                <label htmlFor="login-username">Username:</label>
                <input type="text" maxLength={12} id="login-username" name="login-username"
                       autoFocus={true} />

                <label htmlFor="login-password">Password:</label>
                <input type="password" maxLength={20} id="login-password" name="login-password"/>
            </form>

            <div id="title-button-container">
                <div className="title-button" style={{
                    background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                }}>Login</div>
                <div className="title-button" style={{
                    background: `url('data:image/png;base64,${this.state.titleButtonBase64}')`
                }} onClick={this.back}>Cancel</div>
            </div>
        </>

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
                    {views[this.state.view]}
                </div>
            </div>
        );
    }

}
