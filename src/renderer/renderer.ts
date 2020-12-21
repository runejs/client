import { drawFlames } from './runes';
import { ipcRenderer } from 'electron';


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

ipcRenderer.on('synchronous-message', (event, args) => {
    if(args.type === 'runes') {
        drawFlames(args.runes, args.titlePixels);
    } else if(args.type === 'logo') {
        showLogo(args.base64);
    } else if(args.type === 'titleBox') {
        showTitleBox(args.base64);
    } else if(args.type === 'titleButton') {
        showTitleButton(args.base64);
    }
});
