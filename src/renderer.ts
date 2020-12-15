import { ipcRenderer } from 'electron';
//import { drawFlames } from './runes';

ipcRenderer.on('synchronous-message', (event, args) => {
    console.log(args);
    if(args.type === 'runes') {
        //drawFlames(args.runes, document);
    }
});
