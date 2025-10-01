var puzzle = {
  title: "- MSG.0 -",
  mainMessage: "> READ A VALUE FROM IN.X\n  WRITE THE VALUE TO OUT.CONSOLE",
  inputs: [
    { label: "IN.X", values: [69, 52, 52, 114, 107, 109, 117, 74, 126, 114, 111, 74, 122, 118, 107, 120, 111, 126, 75] },
    {},
    {},
    {}
  ],
  outputs: [
    {label: "OUT.CONSOLE", values: []},
    {},
    { label: "DEV.NULL", values: [] },
    {}
  ],
  nodes: [
    /* row 1 */
    {
        id: 0,
        type: "basic",
        program: [
            "# ASCII CONS INPUT?",
            "",
            "MOV UP ACC",
            "MOV ACC RIGHT",
        ]
    },
    {
        id: 1,
        type: "stackmem",
    },
    {
        id: 2,
        type: "basic",
        program: [
            "LOOP:",
            "MOV ACC RIGHT",
            "ADD 1",
            "SAV",
            "SUB 10",
            "JEZ DUMP",
            "SWP",
            "JMP LOOP",
            "DUMP:",
            "MOV 1 DOWN",
            "MOV DOWN NIL"
        ]
    },
    {
        id: 3,
        type: "stackmem",
    },
    /* row 2 */
    {
        id: 4,
        type: "basic",
        program: [
            "# SET CURSOR POS",
            "MOV 27 DOWN",
            "# WRITE X POS",
            "MOV 16 DOWN",
            "# WRITE Y POS",
            "MOV 10 DOWN",
            "# WRITE ASCII CHARS",
            "MOV 115 DOWN",
            "MOV 121 DOWN",
            "MOV 115 DOWN",
            "MOV 116 DOWN",
            "MOV 101 DOWN",
            "MOV 109 DOWN",
            "MOV 106 DOWN",
        ]
    },
    {
        id: 5,
        type: "damaged",
        debugMessage: "THE INPUT AP█?ARS TO BE FOR THE ASCII CON█ LE BUT TH█ MES█$GE IS MASKED WITH S█ME KIND OF SIMPLE CIPH<█. THEY'RE WATCHING EVERYTHING. I DON'T HAVE TIM█ TO DE█=.PT IT NOW.\n\nTRUST NO ONE",
    },
    {
        id: 6,
        type: "basic",
        program: [
            "MOV UP NIL",
            "MOV 1 RIGHT",
            "LOOP:",
            "MOV RIGHT ACC",
            "MOV ACC DOWN",
            "JEZ DONE",
            "JMP LOOP",
            "DONE:",
            "MOV 1 UP"
        ]
    },
    {
        id: 7,
        type: "basic",
        program: [
            "START:",
            "MOV LEFT NIL",
            "LOOP:",
            "MOV UP ACC",
            "MOV ACC LEFT",
            "JEZ START",
            "JMP LOOP"
        ]
    },
    /* row 3 */
    {
        id: 8,
        type: "basic",
        program: [
            "# GET CHAR",
            "MOV UP ACC",
            "",
            "# ADD MODIFIER",
            "ADD RIGHT",
            "",
            "# WRITE TO CONSOLE",
            "MOV ACC DOWN",
        ]
    },
    {
        id: 9,
        type: "basic",
        program: [
            "START:",
            "MOV 10 ACC",
            "LOOP1:",
            "MOV 0 LEFT",
            "SUB 1",
            "JGZ LOOP1",
            "MOV 7 ACC",
            "MOV 0 LEFT",
            "MOV 0 LEFT",
            "MOV 0 LEFT",
            "LOOP2:",
            "# UPPERCASE OFFSET",
            "MOV -32 LEFT",
            "SUB 1",
            "JGZ LOOP2",
        ]
    },
    {
        id: 10,
        type: "basic",
        program: [
            "     ##########",
            "     ##########",
            "     ##########",
            "     ##########",
            "     ##########",
            "    MOV  UP DOWN",
            " ################## ",
            "  ################",
            "   ##############",
            "    ############",
            "     ##########",
            "      ########",
            "       ######",
            "        ####",
            "         ##",
        ]
    },
    {
        id: 11,
        type: "damaged",
    }
  ]
};
