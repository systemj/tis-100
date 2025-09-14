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
    read: false,
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

var basicNodeHtml = '\
  <div class="node basic-node" id="node-${id}">\
    <div class="node-arrows">\
      <span class="node-arrow node-arrow-up" id="arrow-up-node-${id}">⬆</span>\
      <span class="node-output-value node-output-up" id="output-up-node-${id}"></span>\
      <span class="node-arrow node-arrow-right" id="arrow-right-node-${id}">➡</span>\
      <span class="node-output-value node-output-right" id="output-right-node-${id}"></span>\
      <span class="node-arrow node-arrow-down" id="arrow-down-node-${id}">⬇</span>\
      <span class="node-output-value node-output-down" id="output-down-node-${id}"></span>\
      <span class="node-arrow node-arrow-left" id="arrow-left-node-${id}">⬅</span>\
      <span class="node-output-value node-output-left" id="output-left-node-${id}"></span>\
    </div>\
    <div class="node-main"><div class="node-code-area">\
      <div class="node-line" id="node-line-0-node-${id}"></div>\
      <div class="node-line" id="node-line-1-node-${id}"></div>\
      <div class="node-line" id="node-line-2-node-${id}"></div>\
      <div class="node-line" id="node-line-3-node-${id}"></div>\
      <div class="node-line" id="node-line-4-node-${id}"></div>\
      <div class="node-line" id="node-line-5-node-${id}"></div>\
      <div class="node-line" id="node-line-6-node-${id}"></div>\
      <div class="node-line" id="node-line-7-node-${id}"></div>\
      <div class="node-line" id="node-line-8-node-${id}"></div>\
      <div class="node-line" id="node-line-9-node-${id}"></div>\
      <div class="node-line" id="node-line-10-node-${id}"></div>\
      <div class="node-line" id="node-line-11-node-${id}"></div>\
      <div class="node-line" id="node-line-12-node-${id}"></div>\
      <div class="node-line" id="node-line-13-node-${id}"></div>\
      <div class="node-line" id="node-line-14-node-${id}"></div>\
    </div>\
      <div class="node-status">\
        <div class="node-status-box node-acc">\
          <div class="node-status-label">ACC</div>\
          <div class="node-status-value" id="node-status-value-acc-node-${id}"></div>\
        </div>\
        <div class="node-status-box node-bak">\
          <div class="node-status-label">BAK</div>\
          <div class="node-status-value" id="node-status-value-bak-node-${id}"></div>\
        </div>\
        <div class="node-status-box node-last">\
          <div class="node-status-label">LAST</div>\
          <div class="node-status-value" id="node-status-value-last-node-${id}">N/A</div>\
        </div>\
        <div class="node-status-box node-mode">\
          <div class="node-status-label">MODE</div>\
          <div class="node-status-value" id="node-status-value-mode-node-${id}">IDLE</div>\
        </div>\
        <div class="node-status-box node-idle">\
          <div class="node-status-label">IDLE</div>\
          <div class="node-status-value" id="node-status-value-idle-node-${id}">100%</div>\
        </div>\
      </div>\
    </div>\
  </div>\
';

var StackMemoryNodeHtml = '\
  <div class="node stack-memory" id="node-${id}">\
    <div class="node-arrows">\
      <span class="node-arrow node-arrow-up" id="arrow-up-node-${id}">⬆</span>\
      <span class="node-output-value node-output-up" id="output-up-node-${id}"></span>\
      <span class="node-arrow node-arrow-right" id="arrow-right-node-${id}">➡</span>\
      <span class="node-output-value node-output-right" id="output-right-node-${id}"></span>\
      <span class="node-arrow node-arrow-down" id="arrow-down-node-${id}">⬇</span>\
      <span class="node-output-value node-output-down" id="output-down-node-${id}"></span>\
      <span class="node-arrow node-arrow-left" id="arrow-left-node-${id}">⬅</span>\
      <span class="node-output-value node-output-left" id="output-left-node-${id}"></span>\
    </div>\
    <div class="node-main">\
      <div class="node-code-area">\
        <div class="node-message-box-stack">\
          <div class="node-message-bar"></div>\
          <div class="node-message">STACK MEMORY NODE</div>\
          <div class="node-message-bar"></div>\
        </div>\
      </div>\
      <div class="node-stack-box">\
        <div class="stack-mem-value" id="mem-value-0-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-1-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-2-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-3-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-4-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-5-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-6-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-7-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-8-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-9-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-10-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-11-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-12-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-13-node-${id}"></div>\
        <div class="stack-mem-value" id="mem-value-14-node-${id}"></div>\
      </div>\
    </div>\
  </div>\
';

var DamagedNodeHtml = '\
  <div class="node damaged-node" id="node-${id}">\
    <div class="node-main"><div class="node-code-area">\
      <div class="node-message-box-damaged">\
        <div class="node-message-bar-red"></div>\
        <div class="node-message">COMMUNICATION<br>FAILURE</div>\
        <div class="node-message-bar-red"></div>\
      </div>\
      <div class="debug-button" id="debug-button-node-${id}">DEBUG</div>\
    </div>\
      <div class="node-status">\
        <div class="node-status-box node-acc">\
        </div>\
        <div class="node-status-box node-bak">\
        </div>\
        <div class="node-status-box node-last">\
        </div>\
        <div class="node-status-box node-mode">\
        </div>\
        <div class="node-status-box node-idle">\
        </div>\
      </div>\
    </div>\
  </div>\
';
