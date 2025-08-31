var basicNodeState = {
    program: [],
    program_text: [],
    label_map: {}, /* maps label names to their corresponding instruction indices */
    line_map: {}, /* maps instruction to their corresponding line numbers */
    program_counter: 0,
    output_top: null,
    output_bottom: null,
    output_left: null,
    output_right: null,
    acc: 0,
    bak: 0,
    last: 0,
    mode: "IDLE",
    idle: 100,
    neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null
    }
}

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

var damagedNodeState = {
    output_top: null,
    output_bottom: null,
    output_left: null,
    output_right: null
}

var inputState = {
    values: [],
    output_bottom: null
}

var outputState =  {
    values: [],
    neighbor: null
}


current_state = {
    nodes: [],
    input: [],
    output: []
}

next_state = {
    nodes: [],
    input: [],
    output: []
}


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
                // Capture live program data from DOM and remove comments
                const nodeElement = document.querySelector(`#node-${nodeConfig.id}`);
                if (nodeElement) {
                    const codeLines = nodeElement.querySelectorAll('.node-line');
                    nodeState.program_text = Array.from(codeLines).map(line => {
                        let text = line.textContent || '';
                        // Remove leading whitespace
                        text = text.trimStart();
                        // Remove comments (everything from # to end of line)
                        const commentIndex = text.indexOf('#');
                        if (commentIndex !== -1) {
                            text = text.substring(0, commentIndex);
                        }
                        // Remove trailing whitespace
                        return text.trimEnd();
                    });

                    // Create label mappings and remove labels from lines
                    nodeState.program_text = nodeState.program_text.map((line, lineIndex) => {
                        if (line.includes(':')) {
                            const colonIndex = line.indexOf(':');
                            const labelName = line.substring(0, colonIndex).trim();
                            if (labelName && /^[A-Za-z_][A-Za-z0-9_]*$/.test(labelName)) {
                                nodeState.label_map[labelName] = lineIndex;
                                // Remove the label from the line, keeping any instruction after the colon
                                return line.substring(colonIndex + 1).trim();
                            }
                        }
                        return line;
                    });
                } else {
                    nodeState.program_text = [];
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
