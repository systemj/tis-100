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
