type Point = {
    x: number;
    y: number;
};

type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
};

type SvgState = {
    rectangles: Rectangle[];
};

let svgCanvas = document.getElementById('svgCanvas') as unknown as SVGSVGElement;
let fillColorInput = document.getElementById('fillColor') as HTMLInputElement;
let rectangleForm = document.getElementById('rectangleForm') as HTMLFormElement;
let addButton = document.getElementById('addButton') as HTMLButtonElement;
let removeInfo = document.getElementById('removeInfo') as HTMLDivElement;
let removeButton = document.getElementById('removeButton') as HTMLButtonElement;
let clearButton = document.getElementById('clearButton') as HTMLButtonElement;

let isDrawing = false;
let startPoint: Point | null = null;
let selectedRect: SVGRectElement | null = null;
let state: SvgState = { rectangles: [] };

// Event listeners for drawing rectangles
svgCanvas.addEventListener('mousedown', startDrawing);
svgCanvas.addEventListener('mousemove', drawRectangle);
svgCanvas.addEventListener('mouseup', endDrawing);

// Event listeners for buttons
addButton.addEventListener('click', addRectangleFromForm);
removeButton.addEventListener('click', removeSelectedRectangle);
clearButton.addEventListener('click', clearCanvas);

function startDrawing(event: MouseEvent) {
    isDrawing = true;
    startPoint = getMousePosition(event);
    /*let existingRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    existingRect.classList.add('drawing'); // właśnie powstaje
    existingRect.setAttribute('fill', fillColorInput.value);
    existingRect.setAttribute('x', getMousePosition(event).x.toString());
    existingRect.setAttribute('y', getMousePosition(event).y.toString());
    existingRect.setAttribute('width', '0');
    existingRect.setAttribute('height', '0');
    svgCanvas.appendChild(existingRect);*/
}

function drawRectangle(event: MouseEvent) {
    if (!isDrawing || !startPoint)
        return;

    let currentPoint = getMousePosition(event);
    let existingRect = svgCanvas.querySelector('rect.drawing') as SVGRectElement;

    if (!existingRect) {
        existingRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        existingRect.classList.add('drawing'); // właśnie powstaje
        existingRect.setAttribute('fill', fillColorInput.value);    
        svgCanvas.appendChild(existingRect);
    }

    let x = Math.min(startPoint.x, currentPoint.x);
    let y = Math.min(startPoint.y, currentPoint.y);
    let width = Math.abs(startPoint.x - currentPoint.x);
    let height = Math.abs(startPoint.y - currentPoint.y);

    existingRect.setAttribute('x', x.toString());
    existingRect.setAttribute('y', y.toString());
    existingRect.setAttribute('width', width.toString());
    existingRect.setAttribute('height', height.toString());
}

function endDrawing(event: MouseEvent) {
    if (!isDrawing || !startPoint)
        return;
    isDrawing = false;
    startPoint = null;

    let drawingRect = svgCanvas.querySelector('rect.drawing') as SVGRectElement;
    if (drawingRect) {
        drawingRect.classList.remove('drawing'); // przestał powstawać
        let rect: Rectangle = {
            x: parseFloat(drawingRect.getAttribute('x')!),
            y: parseFloat(drawingRect.getAttribute('y')!),
            width: parseFloat(drawingRect.getAttribute('width')!),
            height: parseFloat(drawingRect.getAttribute('height')!),
            fill: drawingRect.getAttribute('fill')!
        };
        if (rect.width == 0 || rect.height == 0)
            svgCanvas.removeChild(drawingRect);
        else
            state.rectangles.push(rect);
        svgCanvas.addEventListener('click', selectRectangle);
        // Example usage of serialisation
        // Save the current state to JSON
        let serializedState = serializeState();
        console.log(serializedState);

        // Load the state from JSON
        deserializeState(serializedState);
    }
}

function addRectangleFromForm() {
    let x1 = parseFloat((document.getElementById('x1') as HTMLInputElement).value);
    let y1 = parseFloat((document.getElementById('y1') as HTMLInputElement).value);
    let x2 = parseFloat((document.getElementById('x2') as HTMLInputElement).value);
    let y2 = parseFloat((document.getElementById('y2') as HTMLInputElement).value);

    let rect: Rectangle = {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x1 - x2),
        height: Math.abs(y1 - y2),
        fill: fillColorInput.value
    };

    let rectElement = createRectElement(rect);
    rectElement.addEventListener('click', selectRectangle);
    svgCanvas.appendChild(rectElement);

    state.rectangles.push(rect);
}

function createRectElement(rect: Rectangle): SVGRectElement {
    let rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectElement.setAttribute('x', rect.x.toString());
    rectElement.setAttribute('y', rect.y.toString());
    rectElement.setAttribute('width', rect.width.toString());
    rectElement.setAttribute('height', rect.height.toString());
    rectElement.setAttribute('fill', rect.fill);
    return rectElement;
}

function selectRectangle(event: MouseEvent) {
    let rect = event.target as SVGRectElement;
    if (selectedRect) {
        selectedRect.classList.remove('selected');
    }
    if (rect instanceof SVGRectElement) {
        selectedRect = rect;
        selectedRect.classList.add('selected');

        let x = rect.getAttribute('x');
        let y = rect.getAttribute('y');
        let width = rect.getAttribute('width');
        let height = rect.getAttribute('height');

        removeInfo.innerHTML = `Selected Rectangle: x=${x}, y=${y}, width=${width}, height=${height}`;
    }
    else { // kliknięcie na obrazek poza wyznaczonymi prostokątami
        removeInfo.innerHTML = '';
    }
}

function removeSelectedRectangle() {
    if (selectedRect) {
        let index = state.rectangles.findIndex(rect => 
            rect.x === parseFloat(selectedRect!.getAttribute('x')!) &&
            rect.y === parseFloat(selectedRect!.getAttribute('y')!) &&
            rect.width === parseFloat(selectedRect!.getAttribute('width')!) &&
            rect.height === parseFloat(selectedRect!.getAttribute('height')!) &&
            rect.fill === selectedRect!.getAttribute('fill')
        );
        if (index > -1) {
            state.rectangles.splice(index, 1);
        }
        svgCanvas.removeChild(selectedRect);
        selectedRect = null;
        removeInfo.innerHTML = '';
    }
}

function clearCanvas() {
    while (svgCanvas.firstChild) {
        svgCanvas.removeChild(svgCanvas.firstChild);
    }
    state.rectangles = [];
}

function getMousePosition(event: MouseEvent): Point {
    let rect = svgCanvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Functions for serializing and deserializing state
function serializeState(): string {
    return JSON.stringify(state);
}

function deserializeState(serializedState: string) {
    clearCanvas();
    state = JSON.parse(serializedState);
    state.rectangles.forEach(rect => {
        let rectElement = createRectElement(rect);
        rectElement.addEventListener('click', selectRectangle);
        svgCanvas.appendChild(rectElement);
    });
}
