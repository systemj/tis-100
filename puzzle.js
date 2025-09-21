var puzzle = {
  title: "- TEST PUZZLE -",
  mainMessage: "> READ A VALUE FROM IN.X AND\n  WRITE THE VALUE TO OUT.CONSOLE",
  inputs: [
    { label: "IN.X", values: [27, 16, 10, 115, 121, 115, 116, 101, 109, 106] },
    {},
    { label: "IN.Y", values: [0]},
    {}
  ],
  outputs: [
    {label: "OUT.CONSOLE", values: []},
    {},
    { label: "OUT.A", values: [1, 2, 3, 4, 5, 6, 7] },
    {}
  ],
  nodes: [
    /* row 1 */
    {
        id: 0,
        type: "basic",
        program: [
            "# TEST",
            "",
            "MOV UP, ACC",
            "MOV ACC DOWN",
            "MOV ACC RIGHT",
            "",
            "",
            "",
            "",
            ""
        ]
    },
    {
        id: 1,
        type: "stackmem",
    },
    {
        id: 2,
        type: "basic",
        program: []
    },
    {
        id: 3,
        type: "damaged",
        debugMessage: ""
    },
    /* row 2 */
    {
        id: 4,
        type: "basic",
        program: [
            "MOV 27 DOWN",
            "MOV 16 DOWN",
            "MOV 10 DOWN",
            "MOV 115 DOWN",
            "MOV 121 DOWN",
            "MOV 115 DOWN",
            "MOV 116 DOWN",
            "MOV 101 DOWN",
            "MOV 109 DOWN",
            "MOV 106 DOWN",
            "",
            "",        ]
    },
    {
        id: 5,
        type: "damaged",
        debugMessage: "NO, SHE WONT UNDERSTAND.  OF COURSE SHE DOESN'T. WHY\nWOULD YOU EXPECT HER TO?",
    },
    {
        id: 6,
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
        id: 7,
        type: "stackmem"
    },
    /* row 3 */
    {
        id: 8,
        type: "basic",
        program: [
            "MOV UP ACC",
            "ADD RIGHT",
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
            "MOV -32 LEFT",
            "SUB 1",
            "JGZ LOOP2",
        ]
    },
    {
        id: 10,
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
        id: 11,
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
    }
  ]
};
