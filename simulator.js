var simulationState = "stop"; // "run", "step" "stop"
var simulationSpeed = 250; // milliseconds per cycle
var allSyntaxOK = true;
var consoleCursorX = 0;
var consoleCursorY = 0;
var consoleBuffer = [];
var consoleExpectingX = false;
var consoleExpectingY = false;
var cycleCount = 0; // Global variable to track total number of cycles
var cycleHz = 0;

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

    // Initialize console state
    consoleCursorX = 0;
    consoleCursorY = 0;
    consoleBuffer = [];
    consoleExpectingX = false;
    consoleExpectingY = false;

    // Initialize allSyntaxOK to true, will be set to false if any node has syntax errors
    allSyntaxOK = true;

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

                    // Update global syntax status
                    if (!parseResult.syntaxOK) {
                        allSyntaxOK = false;
                    }
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
        // Check if there's already an entry for this neighbor in readNeighborUpdates
        const existingUpdate = readNeighborUpdates.find(update =>
            update.neighbor.l === neighbor.l && update.neighbor.i === neighbor.i
        );
        if (existingUpdate) {
            return null;
        }

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
    if (nextOutputState.label.length === 0) {
        return nextOutputState; // No label means inactive output port
    }
    outputValue = readNeighbor(nextOutputState.neighbors, "up");
    if (outputValue !== null) {
        nextOutputState.values.push(outputValue);
    }
    return nextOutputState;
}

function nextBasicNodeState(nodeIndex) {
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
        nextNodeState.run_cycles++;
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

        if (src === 'ACC') {
            nextNodeState.mode = "RUN";
            value = nextNodeState.acc;
        }
        if (src === 'NIL') {
            nextNodeState.mode = "RUN";
            value = 0;
        }
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
        if (!isNaN(intValue)) {
            nextNodeState.mode = "RUN";
            value = intValue;
        }

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
                    // Wrap ACC value to stay within -999 to 999 range
                    if (nextNodeState.acc > 999) {
                        nextNodeState.acc = -999 + (nextNodeState.acc - 1000);
                    } else if (nextNodeState.acc < -999) {
                        nextNodeState.acc = 999 + (nextNodeState.acc + 1000);
                    }
                }
            }
            break;

        case 'SUB':
            if (statement.length >= 2) {
                const value = getValue(statement[1]);
                if (value !== null) {
                    nextNodeState.acc -= value;
                    // Wrap ACC value to stay within -999 to 999 range
                    if (nextNodeState.acc > 999) {
                        nextNodeState.acc = -999 + (nextNodeState.acc - 1000);
                    } else if (nextNodeState.acc < -999) {
                        nextNodeState.acc = 999 + (nextNodeState.acc + 1000);
                    }
                }
            }
            break;

        case 'NEG':
            nextNodeState.mode = "RUN";
            nextNodeState.acc = -nextNodeState.acc;
            break;

        case 'SWP':
            nextNodeState.mode = "RUN";
            const temp = nextNodeState.acc;
            nextNodeState.acc = nextNodeState.bak;
            nextNodeState.bak = temp;
            break;

        case 'SAV':
            nextNodeState.mode = "RUN";
            nextNodeState.bak = nextNodeState.acc;
            break;

        case 'JMP':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    nextNodeState.run_cycles++;
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JEZ':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2 && nextNodeState.acc === 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    nextNodeState.run_cycles++;
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JNZ':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2 && nextNodeState.acc !== 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    nextNodeState.run_cycles++;
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JGZ':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2 && nextNodeState.acc > 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    nextNodeState.run_cycles++;
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JLZ':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2 && nextNodeState.acc < 0) {
                const label = statement[1];
                if (nextNodeState.label_map.hasOwnProperty(label)) {
                    nextNodeState.program_counter = nextNodeState.label_map[label];
                    nextNodeState.run_cycles++;
                    return nextNodeState; // Don't increment program counter
                }
            }
            break;

        case 'JRO':
            nextNodeState.mode = "RUN";
            if (statement.length >= 2) {
                const offset = getValue(statement[1]);
                let newPC = nextNodeState.program_counter + offset;
                // Wrap around if necessary
                while (newPC < 0) newPC += nextNodeState.program.length;
                while (newPC >= nextNodeState.program.length) newPC -= nextNodeState.program.length;
                nextNodeState.program_counter = newPC;
                nextNodeState.run_cycles++;
                return nextNodeState; // Don't increment program counter
            }
            break;

        case 'NOP':
            nextNodeState.mode = "RUN";
            // No operation - just increment program counter
            break;

        case 'HCF':
            nextNodeState.mode = "HALT";
            // Halt and catch fire - stop execution
            break;
    }



    // Check if the node is blocked
    if (!nextNodeState.blocked && nextNodeState.mode !== "WRITE") {
        // Increment program counter for most instructions
        incrementProgramCounter(nextNodeState);
    }

    // Calculate idle percentage
    if (cycleCount > 0 && cycleCount % 10 === 0) {
        nextNodeState.idle = Math.floor((cycleCount - nextNodeState.run_cycles) / cycleCount * 100);
    }

    return nextNodeState;
}

// Helper function to increment program counter with wraparound
function incrementProgramCounter(nodeState) {
    nodeState.program_counter++;
    if (nodeState.program_counter >= nodeState.program.length) {
        nodeState.program_counter = 0;
    }
    nodeState.run_cycles++;
}

function nextStackMemoryNodeState(nodeIndex) {
    const currentNodeState = current_state.nodes[nodeIndex];
    const nextNodeState = structuredClone(currentNodeState);

    if (nextNodeState.read === true) {
        // Set read to false and pop the top value from the stack (discarded)
        nextNodeState.read = false;
        // if (nextNodeState.stack.length > 0) {
        //     nextNodeState.stack.pop();
        // }
    } else {
        // Read values from each direction in order: left, up, right, down
        // Only if the stack is not full (maximum 15 values)
        if (nextNodeState.stack.length < 15) {
            const directions = ['left', 'up', 'right', 'down'];

            for (const direction of directions) {
                const value = readNeighbor(nextNodeState.neighbors, direction);
                if (value !== null) {
                    nextNodeState.stack.push(value);
                    // If the stack is now full, stop reading values
                    if (nextNodeState.stack.length >= 15) {
                        break;
                    }
                }
            }
        }
    }

    // If there are any values on the stack, write the top value to all output directions
    if (nextNodeState.stack.length > 0) {
        const topValue = nextNodeState.stack[nextNodeState.stack.length - 1];
        nextNodeState.output.up = topValue;
        nextNodeState.output.down = topValue;
        nextNodeState.output.left = topValue;
        nextNodeState.output.right = topValue;
    }

    return nextNodeState;
}

function nextState() {
    // Increment global cycle count
    cycleCount++;

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
        if (nodeState.kind === "basic") {
            next_state.nodes.push(nextBasicNodeState(nodeIndex));
        } else if (nodeState.kind === "stackmem") {
            next_state.nodes.push(nextStackMemoryNodeState(nodeIndex));
        } else {
            // damaged or stackmem nodes just carry forward their state
            next_state.nodes.push(structuredClone(current_state.nodes[nodeIndex]));
        }
    });

    // // Now handle stack memory nodes separately to ensure they see the updated state
    // // of other nodes after they have executed their instructions
    // current_state.nodes.forEach((nodeState, nodeIndex) => {
    // });

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

        // complicated read logic for stack memory nodes
        if (next_state[update.neighbor.l][update.neighbor.i].kind === "stackmem") {
            next_state[update.neighbor.l][update.neighbor.i].read = true;

            if (next_state[update.neighbor.l][update.neighbor.i].stack.length > 0) {
                next_state[update.neighbor.l][update.neighbor.i].stack.pop();
            }

            if (next_state[update.neighbor.l][update.neighbor.i].stack.length > 0) {
                const topValue = next_state[update.neighbor.l][update.neighbor.i].stack[next_state[update.neighbor.l][update.neighbor.i].stack.length - 1];
                next_state[update.neighbor.l][update.neighbor.i].output.up = topValue;
                next_state[update.neighbor.l][update.neighbor.i].output.down = topValue;
                next_state[update.neighbor.l][update.neighbor.i].output.left = topValue;
                next_state[update.neighbor.l][update.neighbor.i].output.right = topValue;
            }
        }
    });
    readNeighborUpdates.length = 0; // Clear updates for next cycle

    // Process console output before committing next_state
    processConsoleOutput();

    // Commit next_state to current_state
    current_state = structuredClone(next_state);

    // Update the UI to reflect the new current_state
    current_state.input.forEach((inputState, inputIndex) => {
        updateOutputUI(inputState, inputIndex);
    });

    current_state.nodes.forEach((nodeState, nodeIndex) => {
        updateNodeUI(nodeState, nodeIndex);
        updateStackNodeUI(nodeState, nodeIndex);
        updateOutputUI(nodeState, nodeIndex);
        updateConsoleDisplay();
    });

    // handle breakpoints
    current_state.nodes.forEach((nodeState, nodeIndex) => {
        if (nodeState.kind === "basic") {
            if (nodeState.program.length > 0) {
                if (nodeState.program[nodeState.program_counter].breakpoint == true) {
                    console.log('Breakpoint hit at node', nodeIndex, 'instruction', nodeState.program_counter);
                    stopAutomaticSimulation();
                    simulationState = "step";
                }
            }
        }
    });

    // Update simulation mode display
    updateSimulationMode();

    // Not updating output UI here, as outputs are passive and only show accumulated values
    // current_state.output.forEach((outputState, outputIndex) => {
    //     updateOutputUI(outputState, outputIndex);
    // });
}

function processConsoleOutput() {
    // Find the index of the OUT.CONSOLE output port
    const consoleOutputIndex = next_state.output.findIndex(output => output.label === "OUT.CONSOLE");
    if (consoleOutputIndex === -1 || !next_state.output[consoleOutputIndex].values || next_state.output[consoleOutputIndex].values.length === 0) {
        return;
    }

    // Process one value at a time (since values arrive one per simulation cycle)
    if (next_state.output[consoleOutputIndex].values.length > 0) {
        const value = next_state.output[consoleOutputIndex].values.shift();

        if (consoleExpectingX) {
            // This value is the X coordinate
            consoleCursorX = Math.max(0, Math.min(39, value));
            consoleExpectingX = false;
            consoleExpectingY = true;
        } else if (consoleExpectingY) {
            // This value is the Y coordinate
            consoleCursorY = Math.max(0, Math.min(21, value));
            consoleExpectingY = false;
            // Update display to show cursor at new position
            // updateConsoleDisplay();
        } else if (value === 27) { // Escape character for cursor positioning
            // Next value will be X coordinate
            consoleExpectingX = true;
        } else if (value === 10) { // Newline character
            // Move cursor to beginning of next line
            consoleCursorX = 0;
            consoleCursorY++;
            if (consoleCursorY >= 22) {
                consoleCursorY = 21;
            }
            // Update display to show cursor at new position
            // updateConsoleDisplay();
        } else if (value >= 32 && value <= 126) { // Printable characters
            // Initialize console buffer if needed
            if (consoleBuffer.length === 0) {
                for (let i = 0; i < 22; i++) {
                    consoleBuffer[i] = new Array(40).fill(' ');
                }
            }

            // Write character to current cursor position
            if (consoleCursorY < 22 && consoleCursorX < 40) {
                consoleBuffer[consoleCursorY][consoleCursorX] = String.fromCharCode(value);

                // Advance cursor
                consoleCursorX++;
                if (consoleCursorX >= 40) {
                    consoleCursorX = 0;
                    consoleCursorY++;
                    if (consoleCursorY >= 22) {
                        consoleCursorY = 0;
                        consoleCursorX = 0;
                    }
                }
            }

            // Update the console display
            // updateConsoleDisplay();
        }
    }
}

function resetSimulation() {
    simulationState = "stop";
    // Reset console state
    consoleCursorX = 0;
    consoleCursorY = 0;
    consoleBuffer = [];
    consoleExpectingX = false;
    consoleExpectingY = false;
    clearConsoleDisplay();
    updateConsoleDisplay();

    // Reset global cycle count
    cycleCount = 0;

    initializeSimulation();
    // Update the UI to reflect the reset state
    current_state.input.forEach((inputState, inputIndex) => {
        updateOutputUI(inputState, inputIndex);
    });
    current_state.nodes.forEach((nodeState, nodeIndex) => {
        updateNodeUI(nodeState, nodeIndex);
        updateStackNodeUI(nodeState, nodeIndex);
        updateOutputUI(nodeState, nodeIndex);
    });
    current_state.output.forEach((outputState, outputIndex) => {
        updateOutputUI(outputState, outputIndex);
    });
}

