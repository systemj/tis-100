var puzzle = {
  title: "- TEST PUZZLE -",
  mainMessage: "> READ A VALUE FROM IN.X AND\n  WRITE THE VALUE TO OUT.CONSOLE",
  inputs: [
    { label: "IN.X", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27] },
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
            "MOV UP DOWN",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ]
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
            "MOV UP DOWN",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ]
    },
    {
        id: 9,
        type: "basic",
        program: []
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
