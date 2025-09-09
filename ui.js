document.addEventListener('DOMContentLoaded', function() {
    initTitleAndMessage();
    initInputPorts();
    initOutputPorts();
    populateNodes();

    /* control buttons */
    document.getElementById('step-button').addEventListener('click', function() {
        if (current_state.nodes.length === 0) {
            initializeSimulation();
            console.log('simulation initialized');
        }
        nextState();
    });

    document.getElementById('run-button').addEventListener('click', function() {
        initializeSimulation();
        console.log('Run button clicked - simulation initialized');
    });

    document.getElementById('fast-button').addEventListener('click', function() {
        initializeSimulation();
        console.log('Fast button clicked - simulation initialized');
    });

    document.getElementById('stop-button').addEventListener('click', function() {
        resetSimulation();
        console.log('Stop button clicked');
    });

    /* dismiss full screen message box */
    document.querySelector('.debug-message-continue-button').addEventListener('click', function() {
        document.getElementById('full-screen-message-box').style.display = 'none';
    });

    document.querySelector('.full-screen-message-box-shade').addEventListener('click', function() {
        document.getElementById('full-screen-message-box').style.display = 'none';
    });
});

function initTitleAndMessage() {
    const titleElement = document.querySelector('.title-message');
    const messageElement = document.querySelector('.main-message-text');

    if (titleElement && puzzle.title) {
        titleElement.textContent = puzzle.title;
    }

    if (messageElement && puzzle.mainMessage) {
        messageElement.textContent = puzzle.mainMessage;
    }
}

function initInputPorts() {
    const inputPorts = [0, 1, 2, 3];
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

function initOutputPorts() {
    const outputPorts = [0, 1, 2, 3];

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

        if (nodeData.type === 'basic') {
            for (let index = 0; index < 15; index++) {
                const lineElement = document.getElementById(`node-line-${index}-node-${nodeData.id}`);
                if (lineElement) {
                    const lineText = nodeData.program && nodeData.program[index] ? nodeData.program[index] : '';
                    lineElement.textContent = lineText;
                    makeLineEditable(lineElement, nodeData.id, index);
                }
            }
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

function findEditTarget(nodeId, clickedLineIndex) {
    const node = puzzle.nodes.find(n => n.id === nodeId);
    if (!node || !node.program) {
        return 0;
    }

    let allFollowingEmpty = true;
    for (let i = clickedLineIndex; i < 15; i++) {
        if (node.program[i] && node.program[i].trim() !== '') {
            allFollowingEmpty = false;
            break;
        }
    }

    if (!allFollowingEmpty) {
        return clickedLineIndex;
    }

    for (let i = 14; i >= 0; i--) {
        if (node.program[i] && node.program[i].trim() !== '') {
            return i + 1 < 15 ? i + 1 : i;
        }
    }

    return 0;
}

function makeLineEditable(lineElement, nodeId, lineIndex) {
    lineElement.addEventListener('click', function() {
        const targetLineIndex = findEditTarget(nodeId, lineIndex);
        if (targetLineIndex !== lineIndex) {
            const targetLineElement = document.getElementById(`node-line-${targetLineIndex}-node-${nodeId}`);
            if (targetLineElement) {
                startEditing(targetLineElement, nodeId, targetLineIndex);
                return;
            }
        }
        startEditing(lineElement, nodeId, lineIndex);
    });
}

function startEditing(lineElement, nodeId, lineIndex) {
    if (lineElement.querySelector('input')) return;

    const currentText = lineElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText.toUpperCase();
    input.spellcheck = false;
    input.maxLength = 20;
    input.style.width = '100%';
    input.style.margin = '0';
    input.style.padding = '0';
    input.style.background = 'transparent';
    input.style.border = 'none';
    input.style.color = 'inherit';
    input.style.font = 'inherit';
    input.style.outline = 'none';

    lineElement.innerHTML = '';
    lineElement.appendChild(input);
    input.focus();
    // input.select();

    function finishEditing(saveChanges = true) {
        const newText = saveChanges ? input.value.trimEnd() : currentText;
        lineElement.textContent = newText;

        if (saveChanges && newText !== currentText) {
            updateNodeProgram(nodeId, lineIndex, newText);
        }
    }

    input.addEventListener('blur', () => finishEditing(true));
    input.addEventListener('escape', () => finishEditing(false));

    input.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                if (lineIndex < 14) {
                    finishEditing(true);
                    navigateToLine(nodeId, lineIndex + 1);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (lineIndex > 0) {
                    finishEditing(true);
                    navigateToLine(nodeId, lineIndex - 1);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (lineIndex < 14) {
                    finishEditing(true);
                    navigateToLine(nodeId, lineIndex + 1);
                }
                break;
            case 'Backspace':
                if (input.selectionStart === 0 && input.selectionEnd === 0 && lineIndex > 0) {
                    e.preventDefault();
                    finishEditing(true);
                    navigateToLine(nodeId, lineIndex - 1);
                }
                break;
            case 'Escape':
                e.preventDefault();
                finishEditing(true);
                break;
        }
    });

    input.addEventListener('input', function(e) {
        const cursorPos = e.target.selectionStart;
        e.target.value = e.target.value.replace(/\n/g, '').toUpperCase();
        e.target.setSelectionRange(cursorPos, cursorPos);
    });
}

function navigateToLine(nodeId, lineIndex) {
    if (lineIndex < 0 || lineIndex >= 15) return;

    const targetLineElement = document.getElementById(`node-line-${lineIndex}-node-${nodeId}`);
    if (targetLineElement) {
        startEditing(targetLineElement, nodeId, lineIndex);
    }
}

function updateNodeProgram(nodeId, lineIndex, newText) {
    const node = puzzle.nodes.find(n => n.id === nodeId);
    if (node) {
        if (!node.program) {
            node.program = new Array(15).fill('');
        }
        while (node.program.length < 15) {
            node.program.push('');
        }
        node.program[lineIndex] = newText;
    }
}


function updateNodeUI(nodeState, nodeIndex) {
    // Only update basic nodes
    if (!nodeState.program) return;

    const nodeId = puzzle.nodes[nodeIndex].id;

    // Clear previous highlighting
    const allLines = document.querySelectorAll(`#node-${nodeId} .node-line`);
    allLines.forEach(line => {
        line.classList.remove('node-line-execute');
    });

    // Highlight current instruction line
    if (nodeState.program.length > 0 && nodeState.program_counter < nodeState.program.length) {
        const currentInstruction = nodeState.program[nodeState.program_counter];
        if (currentInstruction && currentInstruction.lineIndex !== undefined) {
            const currentLineElement = document.getElementById(`node-line-${currentInstruction.lineIndex}-node-${nodeId}`);
            if (currentLineElement) {
                currentLineElement.classList.add('node-line-execute');
            }
        }
    }

    // Update ACC value
    const accElement = document.getElementById(`node-status-value-acc-node-${nodeId}`);
    if (accElement) {
        accElement.textContent = nodeState.acc;
    }

    // Update BAK value
    const bakElement = document.getElementById(`node-status-value-bak-node-${nodeId}`);
    if (bakElement) {
        bakElement.textContent = nodeState.bak;
    }

    // Update LAST value
    const lastElement = document.getElementById(`node-status-value-last-node-${nodeId}`);
    if (lastElement) {
        lastElement.textContent = nodeState.last;
    }

    // Update MODE value
    const modeElement = document.getElementById(`node-status-value-mode-node-${nodeId}`);
    if (modeElement) {
        modeElement.textContent = nodeState.mode;
    }

    // Update IDLE value
    const idleElement = document.getElementById(`node-status-value-idle-node-${nodeId}`);
    if (idleElement) {
        idleElement.textContent = nodeState.idle + '%';
    }
}

function updateOutputUI(object, index) {
    let kind = object.kind;
    if (kind === 'basic' || kind === 'stackmem') {
        kind = 'node';
    }

    if (object.output) {
        Object.keys(object.output).forEach(direction => {
            const arrowElement = document.getElementById(`arrow-${direction}-${kind}-${index}`);
            const outputElement = document.getElementById(`output-${direction}-${kind}-${index}`);

            if (object.output[direction] !== null) {
                if (arrowElement) {
                    arrowElement.classList.add('arrow-active');
                }
                if (outputElement) {
                    outputElement.textContent = object.output[direction];
                }
            } else {
                if (arrowElement) {
                    arrowElement.classList.remove('arrow-active');
                }
                if (outputElement) {
                    outputElement.textContent = '';
                }
            }
        });
    }
}
