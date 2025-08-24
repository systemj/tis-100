# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a visual programming node simulator that displays assembly-like code execution in a retro terminal style. The project simulates nodes that can execute basic assembly instructions like MOV, JLZ, JEZ, and JMP operations.

## Architecture

The project consists of static HTML/CSS files with no build system:

- `index.html` - Main HTML page displaying a single programming node with embedded assembly code
- `node.html` - Alternative/template node structure (appears to be a variant layout)
- `style.css` - Styling using a retro DOS-style font (Perfect DOS VGA 437) and terminal aesthetics
- `test.py` - Minimal Python file (appears incomplete)

## Node Structure

Each node contains:
- **Code Area**: Displays assembly-like instructions (MOV, JLZ, JEZ, JMP, etc.)
- **Status Display**: Shows ACC (accumulator), BAK (backup), LAST, MODE, and IDLE percentage
- **Visual Indicators**: Line highlighting for current execution and directional arrows (currently commented out)

## Assembly Instructions

The code simulates basic assembly operations:
- `MOV` - Move data between registers/directions
- `JLZ` - Jump if less than zero  
- `JEZ` - Jump if equal to zero
- `JMP` - Unconditional jump
- Directional references: UP, DOWN, LEFT, RIGHT
- Registers: ACC (accumulator), NIL (null)

## Development

This is a static HTML project with no build process. Open `index.html` directly in a browser to view the node display.

The visual style mimics retro computing terminals with:
- Black background, white text
- Monospace DOS-style font
- Bordered node containers
- Status register displays