import React from 'react';
import ReactDom from 'react-dom';
import Startup from './startup';
import { ipcRenderer } from 'electron';
import { create, IMidiOutput } from 'midi-player';
import { parseArrayBuffer } from 'midi-json-parser';
import ElectronMidi from 'electron-midi';


const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {

    ipcRenderer.on('synchronous-message', async (event, args) => {
        if(args.type === 'song') {
            const { midi } = args;
            const json = await parseArrayBuffer(Uint8Array.from(Buffer.from(midi)).buffer);
            const midiAccess = await navigator['requestMIDIAccess']();
            console.log(midiAccess);

            const electronMidi = new ElectronMidi();
            electronMidi.init();

            const midiOutput = Array.from(midiAccess.outputs)[0] as IMidiOutput;
            const midiPlayer = create({ json, midiOutput });
            await midiPlayer.play();
        }
    });

    return (
        <Startup />
    );

};

ReactDom.render(<App />, mainElement);
