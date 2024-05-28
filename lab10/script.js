"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function deserialise_state(json) {
    const data = JSON.parse(json);
    console.log(data);
    return {
        rectangles: data.rectangles.map((rect) => ({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            fill: rect.fill
        }))
    };
}
function loadImage(container) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        container.appendChild(spinner);
        try {
            const response = yield fetch('http://localhost:8000/image');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.text();
            const state = deserialise_state(data);
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "300");
            svg.setAttribute("height", "300");
            svg.setAttribute("viewBox", "0 0 400 400");
            container.appendChild(svg);
            state.rectangles.forEach(rect => {
                const svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                svgRect.setAttribute("x", rect.x.toString());
                svgRect.setAttribute("y", rect.y.toString());
                svgRect.setAttribute("width", rect.width.toString());
                svgRect.setAttribute("height", rect.height.toString());
                svgRect.setAttribute("fill", rect.fill);
                svg.appendChild(svgRect);
            });
            spinner.remove();
        }
        catch (error) {
            spinner.remove();
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error loading image';
            errorMessage.classList.add('error');
            container.appendChild(errorMessage);
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Retry';
            retryButton.classList.add('retry-button');
            retryButton.onclick = () => {
                errorMessage.remove();
                retryButton.remove();
                loadImage(container);
            };
            container.appendChild(retryButton);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    var _a;
    const canvasContainers = document.getElementById('canvasContainers');
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
        const state = deserialise_state(event.data);
        const container = document.createElement('div');
        container.classList.add('canvas-container');
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "300");
        svg.setAttribute("height", "300");
        svg.setAttribute("viewBox", "0 0 400 400");
        container.appendChild(svg);
        state.rectangles.forEach(rect => {
            const svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            svgRect.setAttribute("x", rect.x.toString());
            svgRect.setAttribute("y", rect.y.toString());
            svgRect.setAttribute("width", rect.width.toString());
            svgRect.setAttribute("height", rect.height.toString());
            svgRect.setAttribute("fill", rect.fill);
            svg.appendChild(svgRect);
        });
        canvasContainers.appendChild(container);
    };
    ws.onclose = () => {
        console.log("closed");
    };
    ws.onerror = () => {
        console.log("error");
    };
    (_a = document.getElementById('addImageButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch('http://localhost:8000/add_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            console.error('Error adding image:', error);
        }
    }));
});
