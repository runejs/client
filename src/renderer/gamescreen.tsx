import React, { Component } from 'react';


export default class Gamescreen extends Component<{}, {}> {

    componentWillMount() {
    }

    render() {
        return (
            <div id="game-interface">
                <div id="frame-top"></div>
                <div id="frame-left"></div>
                <canvas id="game-screen"></canvas>
                <div id="maparea"></div>
                <div id="tabarea"></div>
                <div id="chatarea"></div>
            </div>
        );
    }

}
