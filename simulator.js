/* basic node state */
var basicNodeState = {
    kind: "basic",
    program: [],
    program_text: [],
    label_map: {}, /* maps label names to their corresponding instruction indices */
    program_counter: 0,
    output: {
        up: null,
        down: null,
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
        up: null,
        down: null,
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
        up: null,
        down: null,
        left: null,
        right: null
    },
    neighbors: {
        up: null,
        down: null,
        left: null,
        right: null
    }
}

/* damaged node state; just null outputs */
var damagedNodeState = {
    kind: "damaged",
    output: {
        up: null,
        down: null,
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
        down: null
    }
}

/* output values state */
var outputState =  {
    kind: "output-port",
    label: "",
    values: [],
    output: {
        up: null,
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
            up: { l: "input", i: 0},
            down: { l: "nodes", i: 4},
            left: null,
            right: { l: "nodes", i: 1}
        },
        /* row 1, node 2 */
        {
            up: { l: "input", i: 1},
            down: { l: "nodes", i: 5},
            left: { l: "nodes", i: 0},
            right: { l: "nodes", i: 2}
        },
        /* row 1, node 3 */
        {
            up: { l: "input", i: 2},
            down: { l: "nodes", i: 6},
            left: { l: "nodes", i: 1},
            right: { l: "nodes", i: 3}
        },
        /* row 1, node 4 */
        {
            up: { l: "input", i: 3},
            down: { l: "nodes", i: 7},
            left: { l: "nodes", i: 2},
            right: null
        },

        /* row 2, node 4 */
        {
            up: { l: "nodes", i: 0},
            down: { l: "nodes", i: 8},
            left: null,
            right: { l: "nodes", i: 5}
        },
        /* row 2, node 5 */
        {
            up: { l: "nodes", i: 1},
            down: { l: "nodes", i: 9},
            left: { l: "nodes", i: 4},
            right: { l: "nodes", i: 6}
        },
        /* row 2, node 6 */
        {
            up: { l: "nodes", i: 2},
            down: { l: "nodes", i: 10},
            left: { l: "nodes", i: 5},
            right: { l: "nodes", i: 7}
        },
        /* row 2, node 7 */
        {
            up: { l: "nodes", i: 3},
            down: { l: "nodes", i: 11},
            left: { l: "nodes", i: 6},
            right: null
        },

        /* row 3, node 8 */
        {
            up: { l: "nodes", i: 4},
            down: { l: "output", i: 0},
            left: null,
            right: { l: "nodes", i: 9}
        },
        /* row 3, node 9 */
        {
            up: { l: "nodes", i: 5},
            down: { l: "output", i: 1},
            left: { l: "nodes", i: 8},
            right: { l: "nodes", i: 10}
        },
        /* row 3, node 10 */
        {
            up: { l: "nodes", i: 6},
            down: { l: "output", i: 2},
            left: { l: "nodes", i: 9},
            right: { l: "nodes", i: 11}
        },
        /* row 3, node 11 */
        {
            up: { l: "nodes", i: 7},
            down: { l: "output", i: 3},
            left: { l: "nodes", i: 10},
            right: null
        }
    ],
    /* neighbors configuration for each input in the puzzle */
    inputs: [
        { down: { l: "nodes", i: 0}},
        { down: { l: "nodes", i: 1}},
        { down: { l: "nodes", i: 2}},
        { down: { l: "nodes", i: 3}},
    ],
    /* neighbors configuration for each output in the puzzle */
    outputs: [
       { up: { l: "nodes", i: 8}},
       { up: { l: "nodes", i: 9}},
       { up: { l: "nodes", i: 10}},
       { up: { l: "nodes", i: 11}},
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
const opposites = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
};

function readNeighbor(neighbors, direction) {

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
        if (nextInputState.output.down === null) {
            // Shift the next item off values to output[down]
            nextInputState.output.down = nextInputState.values.shift();
        }
        // else: do nothing (we are blocked)
    }
    return nextInputState;
}

function nextOutputPortState(outputIndex) {
    const nextOutputState = structuredClone(current_state.output[outputIndex]);
    outputValue = readNeighbor(nextOutputState.neighbors, "up");
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
        if (nextNodeState.mode === "WRITE") {
            // Already in WRITE mode, block this operation
            nextNodeState.blocked = true;
            return null;
        }
        nextNodeState.mode = "READ";
        if (!source) return null;
        const src = source.toUpperCase();
        let value = null;

        if (src === 'ACC') value = nextNodeState.acc;
        if (src === 'NIL') value = 0;
        if (src === 'LEFT') value = readNeighbor(nextNodeState.neighbors, 'left');
        if (src === 'RIGHT') value = readNeighbor(nextNodeState.neighbors, 'right');
        if (src === 'UP') value = readNeighbor(nextNodeState.neighbors, 'up');
        if (src === 'DOWN') value = readNeighbor(nextNodeState.neighbors, 'down');
        if (src === 'ANY') {
            const directions = ['left', 'up', 'right', 'down'];
            for (const dir of directions) {
                value = null;
                const val = readNeighbor(nextNodeState.neighbors, dir);
                if (val !== null) {
                    nextNodeState.last = dir.toUpperCase();
                    value = val;
                    break;
                }
            }
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
        let dst = destination.toUpperCase();
        success = false;

        // handle LAST destination by resolving it to the last successful read direction
        if (dst === 'LAST') {
            dst = nextNodeState.last;
        }

        // Handle register destinations (ACC, NIL) - these don't block
        if (dst === 'ACC') {
            nextNodeState.acc = value;
            success = true;
        } else if (dst === 'NIL') {
            success = true;
            // Do nothing - value is discarded
        } else {
            // Handle port destinations (LEFT, RIGHT, UP, DOWN) - these can block
            if (nextNodeState.mode === "WRITE") {
                // Already in WRITE mode, block this operation
                nextNodeState.blocked = true;
                return false;
            }

            // Set mode to WRITE and attempt to write to port
            nextNodeState.mode = "WRITE";

            if (dst === 'LEFT' && nextNodeState.output.left === null) {
                nextNodeState.output.left = value;
                success = true;
            } else if (dst === 'RIGHT' && nextNodeState.output.right === null) {
                nextNodeState.output.right = value;
                success = true;
            } else if (dst === 'UP' && nextNodeState.output.up === null) {
                nextNodeState.output.up = value;
                success = true;
            } else if (dst === 'DOWN' && nextNodeState.output.down === null) {
                nextNodeState.output.down = value;
                success = true;
            } else if (dst === 'ANY') {
                nextNodeState.output.left = value;
                nextNodeState.output.right = value;
                nextNodeState.output.up = value;
                nextNodeState.output.down = value;
                success = true;
            }
        }

        if (!success) {
            nextNodeState.blocked = true;
        }
        return success
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
                const value = getValue(statement[1]);
                if (value !== null) {
                    nextNodeState.acc += value;
                }
            }
            break;

        case 'SUB':
            if (statement.length >= 2) {
                const value = getValue(statement[1]);
                if (value !== null) {
                    nextNodeState.acc -= value;
                }
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
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JLZ':
            if (statement.length >= 2 && nextNodeState.acc < 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    return nextNodeState; // Don't increment program counter
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
    if (!nextNodeState.blocked && nextNodeState.mode !== "WRITE") {
        // Increment program counter for most instructions
        incrementProgramCounter(nextNodeState);
    }

    return nextNodeState;
}

// Helper function to increment program counter with wraparound
function incrementProgramCounter(nodeState) {
    nodeState.program_counter++;
    if (nodeState.program_counter >= nodeState.program.length) {
        nodeState.program_counter = 0;
    }
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
        // clear all the neighbor outputs in case it was writing to "ANY"
        // a node can only write to one direction at a time
        next_state[update.neighbor.l][update.neighbor.i].output = {
            up: null,
            down: null,
            left: null,
            right: null
        };
        if (next_state[update.neighbor.l][update.neighbor.i].kind === "basic") {
            next_state[update.neighbor.l][update.neighbor.i].mode = "RUN";
            next_state[update.neighbor.l][update.neighbor.i].last = update.direction.toUpperCase();
            incrementProgramCounter(next_state[update.neighbor.l][update.neighbor.i]);
        }
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

