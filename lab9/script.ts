type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
};

type State = {
    rectangles: Rectangle[];
};

function deserialise_state(json: string): State {
    const data = JSON.parse(json);
    console.log(data);
    return {
        rectangles: data.rectangles.map((rect: any) => ({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            fill: rect.fill
        }))
    };
}


async function loadImage(container: HTMLElement) {
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    container.appendChild(spinner);

    try {
        const response = await fetch('http://localhost:8000/image');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        const state: State = deserialise_state(data);

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
    } catch (error) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainers = document.getElementById('canvasContainers');
    for (let i = 0; i < 10; i++) {
        const container = document.createElement('div');
        container.classList.add('canvas-container');
        canvasContainers!.appendChild(container);
        loadImage(container);
    }
});
