/* basic node state */
var basicNodeState = {
    kind: "basic",
    program: [],
    program_text: [],
    label_map: {}, /* maps label names to their corresponding instruction indices */
    program_counter: 0,
    output: {
        top: null,
        bottom: null,
        left: null,
        right: null
    },
    acc: 0,
    bak: 0,
    last: "N/A",
    mode: "IDLE",
    idle: 100,
    blocked: false,
    neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null
    }
}

/* stack memory node state */
var stackMemoryNodeState = {
    kind: "stackmem",
    stack: [],
    blocked: false,
    output: {
        top: null,
        bottom: null,
        left: null,
        right: null
    },
    neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null
    }
}

/* damaged node state; just null outputs */
var damagedNodeState = {
    kind: "damaged",
    output: {
        top: null,
        bottom: null,
        left: null,
        right: null
    },
}

/* input values and output state */
var inputState = {
    kind: "input-port",
    label: "",
    values: [],
    index: 0,
    blocked: false,
    output: {
        bottom: null
    }
}

/* output values state */
var outputState =  {
    kind: "output-port",
    label: "",
    values: [],
    output: {
        top: null,
    },
}

/* current state of all inputs, outputs, and nodes */
current_state = {
    nodes: [],
    input: [],
    output: []
}

/* next state of all inputs, outputs, and nodes - will become current state
for the next clock cycle */
next_state = {
    nodes: [],
    input: [],
    output: []
}

/* mapping of all nodes to their neighbors */
neighbors = {
    nodes: [
        /* row 1, node 1 */
        {
            top: { l: "input", i: 0},
            bottom: { l: "nodes", i: 4},
            left: null,
            right: { l: "nodes", i: 1}
        },
        /* row 1, node 2 */
        {
            top: { l: "input", i: 1},
            bottom: { l: "nodes", i: 5},
            left: { l: "nodes", i: 0},
            right: { l: "nodes", i: 2}
        },
        /* row 1, node 3 */
        {
            top: { l: "input", i: 2},
            bottom: { l: "nodes", i: 6},
            left: { l: "nodes", i: 1},
            right: { l: "nodes", i: 3}
        },
        /* row 1, node 4 */
        {
            top: { l: "input", i: 3},
            bottom: { l: "nodes", i: 7},
            left: { l: "nodes", i: 2},
            right: null
        },

        /* row 2, node 4 */
        {
            top: { l: "nodes", i: 0},
            bottom: { l: "nodes", i: 8},
            left: null,
            right: { l: "nodes", i: 5}
        },
        /* row 2, node 5 */
        {
            top: { l: "nodes", i: 1},
            bottom: { l: "nodes", i: 9},
            left: { l: "nodes", i: 4},
            right: { l: "nodes", i: 6}
        },
        /* row 2, node 6 */
        {
            top: { l: "nodes", i: 2},
            bottom: { l: "nodes", i: 10},
            left: { l: "nodes", i: 5},
            right: { l: "nodes", i: 7}
        },
        /* row 2, node 7 */
        {
            top: { l: "nodes", i: 3},
            bottom: { l: "nodes", i: 11},
            left: { l: "nodes", i: 6},
            right: null
        },

        /* row 3, node 8 */
        {
            top: { l: "nodes", i: 4},
            bottom: { l: "output", i: 0},
            left: null,
            right: { l: "nodes", i: 9}
        },
        /* row 3, node 9 */
        {
            top: { l: "nodes", i: 5},
            bottom: { l: "output", i: 1},
            left: { l: "nodes", i: 8},
            right: { l: "nodes", i: 10}
        },
        /* row 3, node 10 */
        {
            top: { l: "nodes", i: 6},
            bottom: { l: "output", i: 2},
            left: { l: "nodes", i: 8},
            right: { l: "nodes", i: 11}
        },
        /* row 3, node 11 */
        {
            top: { l: "nodes", i: 7},
            bottom: { l: "output", i: 3},
            left: { l: "nodes", i: 10},
            right: null
        }
    ],
    /* neighbors configuration for each input in the puzzle */
    inputs: [
        { bottom: { l: "nodes", i: 0}},
        { bottom: { l: "nodes", i: 1}},
        { bottom: { l: "nodes", i: 2}},
        { bottom: { l: "nodes", i: 3}},
    ],
    /* neighbors configuration for each output in the puzzle */
    outputs: [
       { top: { l: "nodes", i: 8}},
       { top: { l: "nodes", i: 9}},
       { top: { l: "nodes", i: 10}},
       { top: { l: "nodes", i: 11}},
    ]
}

function parseSingleLine(line) {
    let text = line || '';

    // Trim leading/trailing whitespace
    text = text.trim();

    // Check for breakpoint (line begins with "!" character)
    let breakpoint = false;
    if (text.startsWith('!')) {
        breakpoint = true;
        text = text.substring(1).trim();
    }

    // Extract and remove comments (all text following a "#" character)
    let comments = "";
    const commentIndex = text.indexOf('#');
    if (commentIndex !== -1) {
        comments = text.substring(commentIndex + 1).trim();
        text = text.substring(0, commentIndex).trim();
    }

    // Clean remaining punctuation except : and ! and break into statement array
    text = text.replace(/[^\w\s:!-]/g, '');
    const tokens = text ? text.split(/\s+/) : [];

    // Extract labels (words ending with ":") from tokens and move to labels array
    const labels = [];
    const statement = [];

    tokens.forEach(token => {
        if (token.endsWith(':')) {
            const labelCandidate = token.slice(0, -1); // Remove the colon
            if (labelCandidate && /^[A-Za-z_][A-Za-z0-9_]*$/.test(labelCandidate)) {
                labels.push(labelCandidate);
            }
        } else {
            statement.push(token);
        }
    });

    return {
        comments: comments,
        labels: labels,
        statement: statement,
        breakpoint: breakpoint
    };
}

function syntaxCheck(tokenizedLines, labelMap) {
    const validSources = ['ACC', 'NIL', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'ANY', 'LAST'];
    const validDestinations = ['ACC', 'NIL', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'ANY', 'LAST'];

    function isValidInteger(str) {
        const num = parseInt(str, 10);
        return !isNaN(num) && num >= -999 && num <= 999 && str === num.toString();
    }

    function isValidSource(token) {
        return validSources.includes(token) || isValidInteger(token);
    }

    function isValidDestination(token) {
        return validDestinations.includes(token);
    }

    function isValidLabel(token) {
        return labelMap.hasOwnProperty(token);
    }

    function isValidJROOperand(token) {
        return token === 'ACC' || isValidInteger(token);
    }

    let allLinesValid = true;

    for (const line of tokenizedLines) {
        const statement = line.statement;

        // Empty statements are considered valid
        if (statement.length === 0) {
            line.syntaxValid = true;
            continue;
        }

        const instruction = statement[0].toUpperCase();
        let lineValid = true;

        switch (instruction) {
            case 'MOV':
                if (statement.length !== 3) lineValid = false;
                else if (!isValidSource(statement[1]) || !isValidDestination(statement[2])) lineValid = false;
                break;

            case 'ADD':
            case 'SUB':
                if (statement.length !== 2) lineValid = false;
                else if (!isValidSource(statement[1])) lineValid = false;
                break;

            case 'JMP':
            case 'JEZ':
            case 'JNZ':
            case 'JGZ':
            case 'JLZ':
                if (statement.length !== 2) lineValid = false;
                else if (!isValidLabel(statement[1])) lineValid = false;
                break;

            case 'JRO':
                if (statement.length !== 2) lineValid = false;
                else if (!isValidJROOperand(statement[1])) lineValid = false;
                break;

            case 'NOP':
            case 'HCF':
            case 'SWP':
            case 'SAV':
            case 'NEG':
                if (statement.length !== 1) lineValid = false;
                break;

            default:
                lineValid = false;
        }

        line.syntaxValid = lineValid;
        if (!lineValid) {
            allLinesValid = false;
        }
    }

    return { allLinesValid: allLinesValid, tokenizedLines: tokenizedLines };
}

function parseCodeLines(rawLines) {
    const labelMap = {};
    const tokenizedLines = [];
    const tempLabels = [];
    var tempBreak = false;

    rawLines.forEach((line, lineIndex) => {
        const parsed = parseSingleLine(line);

        // If line has no statement, accumulate labels in tempLabels
        if (parsed.statement.length === 0) {
            if (parsed.labels.length > 0) {
                tempLabels.push(...parsed.labels);
            }
            if (parsed.breakpoint) {
                tempBreak = true;
            }
            return;
        } else {
            // Line has a statement, attach any accumulated labels from previous empty lines
            parsed.labels.push(...tempLabels);
            tempLabels.length = 0; // Clear temporary labels
            if (tempBreak) {
                parsed.breakpoint = true;
                tempBreak = false;
            }
        }

        // Store the statement tokens along with it's original index
        parsed.lineIndex = lineIndex;
        tokenizedLines.push(parsed);
    });
    if (tempLabels.length > 0) {
        // If there are leftover labels with no statements, add them to the first line
        if (tokenizedLines.length > 0) {
            tokenizedLines[0].labels.push(...tempLabels);
        }
    }
    // If there was a trailing breakpoint set it on the first line
    if (tempBreak && tokenizedLines.length > 0) {
        tokenizedLines[0].breakpoint = true;
    }

    // Build labelMap from tokenizedLines
    tokenizedLines.forEach((parsed, tokenIndex) => {
        if (parsed.labels.length > 0) {
            parsed.labels.forEach(label => {
                labelMap[label] = tokenIndex;
            });
        }
    });

    // Basic syntax checking
    const syntaxOK = syntaxCheck(tokenizedLines, labelMap);

    return {
        program: syntaxOK.tokenizedLines,
        labelMap: labelMap,
        syntaxOK: syntaxOK.allLinesValid
    };
}



function initializeSimulation() {
    // Clear existing state
    current_state.nodes = [];
    current_state.input = [];
    current_state.output = [];

    // Initialize nodes based on puzzle configuration
    puzzle.nodes.forEach((nodeConfig, index) => {
        let nodeState;

        switch(nodeConfig.type) {
            case 'basic':
                nodeState = JSON.parse(JSON.stringify(basicNodeState));
                // Capture live program data from DOM and process it
                const nodeElement = document.querySelector(`#node-${index}`);
                if (nodeElement) {
                    const codeLines = nodeElement.querySelectorAll('.node-line');
                    const rawLines = Array.from(codeLines).map(line => line.textContent || '');
                    const parseResult = parseCodeLines(rawLines);

                    nodeState.program = parseResult.program;
                    nodeState.program_text = rawLines;
                    nodeState.label_map = parseResult.labelMap;
                    nodeState.syntax_ok = parseResult.syntaxOK;
                } else {
                    nodeState.program_text = [];
                    nodeState.program = [];
                    nodeState.label_map = {};
                    nodeState.syntax_ok = true;
                }
                break;
            case 'stackmem':
                nodeState = JSON.parse(JSON.stringify(stackMemoryNodeState));
                break;
            case 'damaged':
                nodeState = JSON.parse(JSON.stringify(damagedNodeState));
                break;
            default:
                nodeState = JSON.parse(JSON.stringify(basicNodeState));
        }

        // Set up neighbors reference using the exact {l: list, i: index} format
        nodeState.neighbors = neighbors["nodes"][index];

        current_state.nodes.push(nodeState);
    });

    // Initialize input ports
    puzzle.inputs.forEach((inputConfig, index) => {
        let inputPortState;
        inputPortState = JSON.parse(JSON.stringify(inputState));
        inputPortState = Object.assign(inputPortState, inputConfig);
        inputPortState.neighbors = neighbors["inputs"][index];
        current_state.input.push(inputPortState);
    });

    // Initialize output ports
    puzzle.outputs.forEach((outputConfig, index) => {
        let outputPortState;
        outputPortState = JSON.parse(JSON.stringify(outputState));
        outputPortState = Object.assign(outputPortState, outputConfig);
        outputPortState.values = []; // Clear values to start empty
        outputPortState.neighbors = neighbors["outputs"][index];
        current_state.output.push(outputPortState);
    });

    // Copy current_state to next_state for simulation stepping
    // next_state.nodes = current_state.nodes.map(node => JSON.parse(JSON.stringify(node)));
    // next_state.input = current_state.input.map(input => JSON.parse(JSON.stringify(input)));
    // next_state.output = current_state.output.map(output => JSON.parse(JSON.stringify(output)));
}


const readNeighborUpdates = [];

function readNeighbor(neighbors, direction) {
    const opposites = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    };
    const neighbor = neighbors[direction];
    if (neighbor === null) {
        return null;
    } else {
        readValue = current_state[neighbor.l][neighbor.i].output[opposites[direction]];
        if (readValue !== null) {
            readNeighborUpdates.push({
                neighbor,
                direction: opposites[direction]
            })
        }
        return readValue;
    }
}


function nextInputPortState(inputIndex) {
    const nextInputState = structuredClone(current_state.input[inputIndex]);
    if (nextInputState.values.length > 0) {
        if (nextInputState.output.bottom === null) {
            // Shift the next item off values to output[bottom]
            nextInputState.output.bottom = nextInputState.values.shift();
        }
        // else: do nothing (we are blocked)
    }
    return nextInputState;
}

function nextOutputPortState(outputIndex) {
    const nextOutputState = structuredClone(current_state.output[outputIndex]);
    outputValue = readNeighbor(nextOutputState.neighbors, "top");
    if (outputValue !== null) {
        nextOutputState.values.push(outputValue);
    }
    return nextOutputState;
}

function nextNodeState(nodeIndex) {
    const nextNodeState = structuredClone(current_state.nodes[nodeIndex]);
    nextNodeState.blocked = false;

    // Only execute program for basic nodes
    if (nextNodeState.kind !== 'basic' || !nextNodeState.program || nextNodeState.program.length === 0) {
        return nextNodeState;
    }

    const currentInstruction = nextNodeState.program[nextNodeState.program_counter];
    if (!currentInstruction || !currentInstruction.statement || currentInstruction.statement.length === 0) {
        // No instruction to execute, just increment program counter
        nextNodeState.program_counter++;
        if (nextNodeState.program_counter >= nextNodeState.program.length) {
            nextNodeState.program_counter = 0;
        }
        return nextNodeState;
    }

    const statement = currentInstruction.statement;
    const instruction = statement[0].toUpperCase();

    // Helper function to get value from source
    function getValue(source) {
        if (!source) return null;
        const src = source.toUpperCase();
        let value = null;

        if (src === 'ACC') value = nextNodeState.acc;
        if (src === 'NIL') value = 0;
        if (src === 'LEFT') value = readNeighbor(nextNodeState.neighbors, 'left');
        if (src === 'RIGHT') value = readNeighbor(nextNodeState.neighbors, 'right');
        if (src === 'UP') value = readNeighbor(nextNodeState.neighbors, 'top');
        if (src === 'DOWN') value = readNeighbor(nextNodeState.neighbors, 'bottom');
        if (src === 'ANY') {
            const directions = ['top', 'bottom', 'left', 'right'];
            for (const dir of directions) {
                const val = readNeighbor(nextNodeState.neighbors, dir);
                if (val !== null) value = val;
            }
            value = null;
        }
        if (src === 'LAST') return getValue(nextNodeState.last);
        // Handle integer literals
        const intValue = parseInt(src, 10);
        if (!isNaN(intValue)) return intValue;

        if (value === null) {
            nextNodeState.blocked = true;
        }
        return value;
    }

    // Helper function to set value to destination
    function setValue(destination, value) {
        if (!destination) return;
        const dst = destination.toUpperCase();

        if (dst === 'ACC') {
            nextNodeState.acc = value;
        } else if (dst === 'NIL') {
            // Do nothing - value is discarded
        } else if (dst === 'LEFT') {
            nextNodeState.output.left = value;
        } else if (dst === 'RIGHT') {
            nextNodeState.output.right = value;
        } else if (dst === 'UP') {
            nextNodeState.output.top = value;
        } else if (dst === 'DOWN') {
            nextNodeState.output.bottom = value;
        }
    }

    // Execute the instruction
    switch (instruction) {
        case 'MOV':
            if (statement.length === 3) {
                const value = getValue(statement[1]);
                if (value !== null) {
                    setValue(statement[2], value);
                }
            }
            break;

        case 'ADD':
            if (statement.length >= 2) {
                nextNodeState.acc += getValue(statement[1]);
            }
            break;

        case 'SUB':
            if (statement.length >= 2) {
                nextNodeState.acc -= getValue(statement[1]);
            }
            break;

        case 'NEG':
            nextNodeState.acc = -nextNodeState.acc;
            break;

        case 'SWP':
            const temp = nextNodeState.acc;
            nextNodeState.acc = nextNodeState.bak;
            nextNodeState.bak = temp;
            break;

        case 'SAV':
            nextNodeState.bak = nextNodeState.acc;
            break;

        case 'JMP':
            if (statement.length >= 2) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JEZ':
            if (statement.length >= 2 && nextNodeState.acc === 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JNZ':
            if (statement.length >= 2 && nextNodeState.acc !== 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JGZ':
            if (statement.length >= 2 && nextNodeState.acc > 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    // return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JLZ':
            if (statement.length >= 2 && nextNodeState.acc < 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    // return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JRO':
            if (statement.length >= 2) {
                const offset = getValue(statement[1]);
                let newPC = nextNodeState.program_counter + offset;
                // Wrap around if necessary
                while (newPC < 0) newPC += nextNodeState.program.length;
                while (newPC >= nextNodeState.program.length) newPC -= nextNodeState.program.length;
                nextNodeState.program_counter = newPC;
                return nextNodeState; // Don't increment program counter
            }
            break;

        case 'NOP':
            // No operation - just increment program counter
            break;

        case 'HCF':
            // Halt and catch fire - stop execution
            break;
    }

    // Check if the node is blocked
    if (!nextNodeState.blocked) {
        // Increment program counter for most instructions
        nextNodeState.program_counter++;
        if (nextNodeState.program_counter >= nextNodeState.program.length) {
            nextNodeState.program_counter = 0;
        }
    }

    return nextNodeState;
}


function nextState() {
    next_state = {
        nodes: [],
        input: [],
        output: []
    };
    current_state.input.forEach((inputState, inputIndex) => {
        next_state.input.push(nextInputPortState(inputIndex));
    });
    current_state.output.forEach((outputState, outputIndex) => {
        next_state.output.push(nextOutputPortState(outputIndex));
    });
    current_state.nodes.forEach((nodeState, nodeIndex) => {
        next_state.nodes.push(nextNodeState(nodeIndex));
    });

    // Apply all readNeighbor updates after all nodes have read their neighbors
    readNeighborUpdates.forEach(update => {
        next_state[update.neighbor.l][update.neighbor.i].output[update.direction] = null;
        console.log("updating neighbor read", update)
    });
    readNeighborUpdates.length = 0; // Clear updates for next cycle

    // Commit next_state to current_state
    current_state = structuredClone(next_state);

    // Update the UI to reflect the new current_state
    current_state.input.forEach((inputState, inputIndex) => {
        updateOutputUI(inputState, inputIndex);
    });

    current_state.nodes.forEach((nodeState, nodeIndex) => {
        updateNodeUI(nodeState, nodeIndex);
        updateOutputUI(nodeState, nodeIndex);
    });

    // Not updating output UI here, as outputs are passive and only show accumulated values
    // current_state.output.forEach((outputState, outputIndex) => {
    //     updateOutputUI(outputState, outputIndex);
    // });
}

function resetSimulation() {
    initializeSimulation();
    // Update the UI to reflect the reset state
    current_state.input.forEach((inputState, inputIndex) => {
        updateOutputUI(inputState, inputIndex);
    });
    current_state.nodes.forEach((nodeState, nodeIndex) => {
        updateNodeUI(nodeState, nodeIndex);
    });
    current_state.output.forEach((outputState, outputIndex) => {
        updateOutputUI(outputState, outputIndex);
    });
}

