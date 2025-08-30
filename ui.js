document.addEventListener('DOMContentLoaded', function() {
    updateTitleAndMessage();
    updateInputPorts();
    updateOutputPorts();
    populateNodes();

    /* dismiss full screen message box */
    document.querySelector('.debug-message-continue-button').addEventListener('click', function() {
        document.getElementById('full-screen-message-box').style.display = 'none';
    });

    document.querySelector('.full-screen-message-box-shade').addEventListener('click', function() {
        document.getElementById('full-screen-message-box').style.display = 'none';
    });
});

function updateTitleAndMessage() {
    const titleElement = document.querySelector('.title-message');
    const messageElement = document.querySelector('.main-message-text');

    if (titleElement && puzzle.title) {
        titleElement.textContent = puzzle.title;
    }

    if (messageElement && puzzle.mainMessage) {
        messageElement.textContent = puzzle.mainMessage;
    }
}

function updateInputPorts() {
    const inputPorts = ['a', 'b', 'c', 'd'];
    inputPorts.forEach(port => {
        const inputPortElement = document.getElementById(`input-${port}`);
        const inputData = puzzle.inputs[port];
        if (inputPortElement) {
            if (!inputData || Object.keys(inputData).length === 0) {
                inputPortElement.style.display = 'none';
            } else {
                if (inputData.label) {
                    const labelElement = document.getElementById(`input-port-label-${port}`);
                    labelElement.textContent = inputData.label;
                }
            }
        }
    });
}

function updateOutputPorts() {
    const outputPorts = ['a', 'b', 'c', 'd'];

    outputPorts.forEach(port => {
        const outputPortElement = document.getElementById(`output-${port}`);
        const hidePortElement = document.getElementById(`hide-ports-bottom-${port}`);
        const outputData = puzzle.outputs[port];

        if (outputPortElement) {
            if (!outputData || Object.keys(outputData).length === 0) {
                 /* output port label */
                outputPortElement.style.display = 'none';
                /* node output arrow/value */
                if (hidePortElement) {
                    hidePortElement.style.display = 'block';
                }
            } else {
                outputPortElement.textContent = outputData.label;
            }
        }
    });
}

function populateNodes() {
    const nodeGrid = document.querySelector('.node-grid');
    nodeGrid.innerHTML = '';

    puzzle.nodes.forEach(nodeData => {
        let nodeHtml = '';

        switch(nodeData.type) {
            case 'basic':
                nodeHtml = basicNodeHtml.replace(/\${id}/g, nodeData.id);
                break;
            case 'stackmem':
                nodeHtml = StackMemoryNodeHtml.replace(/\${id}/g, nodeData.id);
                break;
            case 'damaged':
                nodeHtml = DamagedNodeHtml.replace(/\${id}/g, nodeData.id);
                break;
            default:
                console.warn(`Unknown node type: ${nodeData.type}`);
                return;
        }

        const nodeElement = document.createElement('div');
        nodeElement.innerHTML = nodeHtml;
        nodeGrid.appendChild(nodeElement.firstElementChild);

        if (nodeData.type === 'basic' && nodeData.program) {
            nodeData.program.forEach((line, index) => {
                const lineElement = document.getElementById(`node-line-${index}-node-${nodeData.id}`);
                if (lineElement) {
                    lineElement.textContent = line;
                }
            });
        }

        if (nodeData.type === 'damaged') {
            const debugButton = document.getElementById(`debug-button-node-${nodeData.id}`);
            if (debugButton) {
                if (!nodeData.debugMessage) {
                    debugButton.style.display = 'none';
                } else {
                    debugButton.addEventListener('click', function() {
                        const debugMessageBox = document.querySelector('.debug-message-box-text');
                        if (debugMessageBox) {
                            debugMessageBox.textContent = nodeData.debugMessage;
                        }
                        document.getElementById('full-screen-message-box').style.display = 'block';
                    });
                }
            }
        }
    });
}

