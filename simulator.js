/* basic node state */
var basicNodeState = {
    program: [],
    program_text: [],
    label_map: {}, /* maps label names to their corresponding instruction indices */
    program_counter: 0,
    output_top: null,
    output_bottom: null,
    output_left: null,
    output_right: null,
    acc: 0,
    bak: 0,
    last: "N/A",
    mode: "IDLE",
    idle: 100,
    neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null
    }
}

/* stack memory node state */
var stackMemoryNodeState = {
    stack: [],
    output_top: null,
    output_bottom: null,
    output_left: null,
    output_right: null,
    neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null
    }
}

/* damaged node state; just null outputs */
var damagedNodeState = {
    output_top: null,
    output_bottom: null,
    output_left: null,
    output_right: null
}

/* input values and output state */
var inputState = {
    values: [],
    output_bottom: null
}

/* output values state */
var outputState =  {
    values: [],
    neighbor: null
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
neighbors = [
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
    },
]

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

function updateNodeUI(nodeIndex, nodeState) {
    // Only update basic nodes
    if (!nodeState.program) return;

    const nodeId = puzzle.nodes[nodeIndex].id;

    // Clear previous highlighting
    const allLines = document.querySelectorAll(`#node-${nodeId} .node-line`);
    allLines.forEach(line => {
        line.classList.remove('node-line-highlight');
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
                const nodeElement = document.querySelector(`#node-${nodeConfig.id}`);
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
        nodeState.neighbors = neighbors[index];

        current_state.nodes.push(nodeState);
    });

    // Initialize input ports
    ['a', 'b', 'c', 'd'].forEach(port => {
        if (puzzle.inputs[port] && puzzle.inputs[port].values) {
            current_state.input.push({
                values: [...puzzle.inputs[port].values],
                output_bottom: null
            });
        } else {
            current_state.input.push({
                values: [],
                output_bottom: null
            });
        }
    });

    // Initialize output ports
    ['a', 'b', 'c', 'd'].forEach(port => {
        current_state.output.push({
            values: [],
            neighbor: null
        });
    });

    // Copy current_state to next_state for simulation stepping
    next_state.nodes = current_state.nodes.map(node => JSON.parse(JSON.stringify(node)));
    next_state.input = current_state.input.map(input => JSON.parse(JSON.stringify(input)));
    next_state.output = current_state.output.map(output => JSON.parse(JSON.stringify(output)));
}
