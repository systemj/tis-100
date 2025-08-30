document.addEventListener('DOMContentLoaded', function() {
    updateTitleAndMessage();
    updateInputPorts();
    updateOutputPorts();

    document.querySelector('.debug-message-continue-button').addEventListener('click', function() {
document.getElementById('full-screen-message-box').style.display = 'none';
});
document.querySelector('.full-screen-message-box-shade').addEventListener('click', function() {
document.getElementById('full-screen-message-box').style.display = 'none';
});
document.querySelector('.debug-button').addEventListener('click', function() {
document.getElementById('full-screen-message-box').style.display = 'block';
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

