# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive TIS-100 inspired landing page that simulates the Tessellated Intelligence System nodes in a web browser. The project features a visual programming environment with multiple execution nodes that run assembly-like code in real-time. Users can interact with the simulation by modifying node programs, stepping through execution, and observing data flow between interconnected nodes. This serves as an engaging interactive demonstration rather than a full puzzle game.

## Architecture

The project consists of static HTML/CSS/JavaScript files with no build system:

- `index.html` - Main HTML page displaying the TIS-100 node grid interface
- `style.css` - Retro DOS-style styling using Perfect DOS VGA 437 font and terminal aesthetics
- `simulator.js` - Core simulation engine implementing TIS-100 node behavior and execution
- `ui.js` - User interface controls for play/pause, step, reset, and node interaction

## Node Structure

Each node implements a Basic Execution Node (T21) containing:

- **Code Area**: 15-line assembly program display with syntax highlighting
- **Registers**: ACC (accumulator), BAK (backup register accessible via SAV/SWP)
- **Communication Ports**: UP, DOWN, LEFT, RIGHT for inter-node data transfer
- **Status Display**: Shows current register values, execution mode, and idle percentage
- **Visual Indicators**: Current instruction highlighting, port activity arrows, execution state
- **Interactive Elements**: Click-to-edit code, step-through debugging, breakpoint support

## Assembly Instructions

Full TIS-100 Basic Execution Node (T21) instruction set:

### Data Movement
- `MOV <SRC>, <DST>` - Move data between registers or ports
- `SWP` - Exchange values of ACC and BAK registers
- `SAV` - Save ACC value to BAK register

### Arithmetic
- `ADD <SRC>` - Add source to ACC
- `SUB <SRC>` - Subtract source from ACC
- `NEG` - Negate ACC value

### Control Flow
- `JMP <LABEL>` - Unconditional jump to label
- `JEZ <LABEL>` - Jump if ACC equals zero
- `JNZ <LABEL>` - Jump if ACC not zero
- `JGZ <LABEL>` - Jump if ACC greater than zero
- `JLZ <LABEL>` - Jump if ACC less than zero
- `JRO <OFFSET>` - Jump relative by offset

### Special Values
- **Registers**: ACC (accumulator), BAK (backup), NIL (null/discard)
- **Ports**: UP, DOWN, LEFT, RIGHT (block until communication completes)
- **Pseudo-ports**: ANY (first available port), LAST (last port used)
- **Literals**: Integer values from -999 to 999

## Interactive Features

The landing page provides several interactive capabilities:

- **Real-time Execution**: Nodes execute programs simultaneously with configurable speed
- **Step Mode**: Single-step through instructions for debugging
- **Code Editing**: Click any node's code area to modify assembly programs
- **Visual Data Flow**: Animated arrows show data transfer between nodes
- **State Inspection**: Real-time display of all register values and execution states
- **Dynamic Grid Layout**: The grid layout of nodes should be defined in a data structure and the individual nodes created dynamically so that the layout can be easily modified.

## Implementation Requirements

- **Performance**: 60fps smooth animation with JavaScript requestAnimationFrame
- **Accuracy**: Faithful recreation of TIS-100 execution model and timing
- **Responsive Design**: Scales appropriately on different screen sizes
- **Accessibility**: Keyboard shortcuts for all major functions
- **Browser Compatibility**: Modern ES6+ features, works in Chrome/Firefox/Safari

## Development

Static HTML/CSS/JavaScript project with no build process:
- Open `index.html` directly in browser
- Uses ES6 modules for code organization
- Retro terminal aesthetic with Perfect DOS VGA 437 font
- CSS Grid for precise node layout matching TIS-100
