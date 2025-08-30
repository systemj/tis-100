var puzzle = {
  title: "- TEST PUZZLE -",
  mainMessage: "> READ A VALUE FROM IN.X AND\n  WRITE THE VALUE TO OUT.A",
  inputs: {
    a: { label: "IN.X", values: [1, 2, 3, 4, 5, 6, 7] },
    b: {},
    c: { label: "IN.Y", values: [0]},
    d: {}
  },
  outputs: {
    a: {},
    b: {},
    c: { label: "OUT.A", values: [1, 2, 3, 4, 5, 6, 7] },
    d: {}
  },
  nodes: [
    /* row 1 */
    {
        id: 1,
        type: "basic",
        program: [
            "# TEST",
            "",
            "MOV UP ACC",
            "ADD 1 ACC"
        ]
    },
    {
        id: 2,
        type: "basic",
        program: []
    },
    {
        id: 3,
        type: "basic",
        program: [
            "# COMMENT",
            "",
            "HCF"
        ]
    },
    {
        id: 4,
        type: "damaged",
        debugMessage: ""
    },
    /* row 2 */
    {
        id: 5,
        type: "stackmem"
    },
    {
        id: 6,
        type: "damaged",
        debugMessage: "NO, SHE WONT UNDERSTAND.  OF COURSE SHE DOESN'T. WHY\nWOULD YOU EXPECT HER TO?",
    },
    {
        id: 7,
        type: "basic",
        program: []
    },
    {
        id: 8,
        type: "stackmem"
    },
    /* row 3 */
    {
        id: 9,
        type: "basic",
        program: []
    },    {
        id: 10,
        type: "basic",
        program: []
    },    {
        id: 11,
        type: "basic",
        program: []
    },    {
        id: 12,
        type: "basic",
        program: []
    }
  ]
};
