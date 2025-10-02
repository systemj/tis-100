# systemj.net tis-100
First and foremost, this is a humble "clone" based on the game TIS-100 by Zachtronics - go check it out along with two other similar Zachtronics games, all of which I can highly recommend:
- [TIS-100](https://www.zachtronics.com/tis-100/)
- [SHENZHEN I/O](https://www.zachtronics.com/shenzhen-io/)
- [EXAPUNKS](https://www.zachtronics.com/exapunks/)

## what
You can see this code in action at [systemj.net](https://systemj.net).

The TIS-100 is a fictional computer system from the game TIS-100, and it's programmed using a simple assembly-like instruction set.  This code (I think) implements all of the instructions from the game.  You can check out the official manual [here](https://www.zachtronics.com/images/TIS-100P%20Reference%20Manual.pdf), and it's also linked from the site above.

There's probably a lot of bugs, especially where read/write ANY is concerned as it's barely tested.

## why
I create this for two reasons:
1. I always wanted to see how the logic of TIS-100 could be implemented
2. I wanted a non-trivial projet to test-run AI assisted coding

## ai code?
The irony of using AI to clone a puzzle game about programming is not lost on me!

This is my first real adventure in using AI to assist with coding anything more than a couple lines here or there.  For this project I used both [Github Copilot](https://github.com/features/copilot) (Pro subscription) and [Claude Code](https://www.claude.com/product/claude-code) (Pro subscription) and I did everyting exclusively in [VS Code](https://code.visualstudio.com/) with the Copilot and Claude plugins.  For reference I'm currently running [Manjaro](https://manjaro.org/) and using the [`visual-studio-code-bin`](https://aur.archlinux.org/packages/visual-studio-code-bin) package from [AUR](https://aur.archlinux.org/).

I used Github Copilot almost exclusively for code completions.  It was OK for this, but I also ended up snoozing it frequently because it became too agressive and annoying.  It worked really well for repeatative operations such as adding `id`s in HTML or adjusting a number of items by the same number of pixels in CSS.  I was surprised by how good it was at those types of opeations.

I would frequently compose instructions for Claude code in an empty tab so that I could gather all my thoughts, and I was also surprised that Copilot would offer completions there as well.  Sometimes the suggestions were really great, but I would also snooze it a lot because the suggestions were crossing into actual code or otherwise too far off from what I was going for.  It might also be my specific theme or environment but I often found it confusing to see where my edits stopped and where Copilot's suggestions began without hitting the Escape key constantly or snoozing Copilot altogether.

Claud Code was quite good most of the time, but I did learn early on that I needed to have a detailed CLAUDE.md file for context (although that has fallen behind a bit), and that every request should be very specific with a fairly narrow scope.  I accepted almost all of the edits suggested by Claude Code, but there were a few that I rejected outright, and a few I ended up stashing and not comitting.  Most requests I ended up rejecting initially got resubmitted with more specific instructions or a smaller overall scope.  Smaller requests for individual functions or features usually worked out fine with no follow-up edits from me.

As far as the codebase goes, Claude code wrote 95% of `ui.js` and `simulator.js`. I made some fixups to both, but most of it, especially `ui.js` is Claude (my Javascript skills are in the "just enough to be dangerous" realm).  I initially tried to use Claude to generate the HTML and CSS from some images of TIS-100, but I ultimately ended up discarding that almost entirely and kept only a handful of lines because I had a very specific look in mind; so I wrote almost all of of `index.html` and `style.css` by hand with some occastional uniform edits by Copilot.  I also wrote all of `puzzle.js` and most of `nodes.js` by hand.  I feel like Claude Code worked pretty well if I defined the data structures and asked for specific features.

Before starting this AI code adventure I watched some videos by [Net Ninja](https://netninja.dev/) that certainly helped:
- [Coding with AI (Copilot) Tutorial](https://www.youtube.com/playlist?list=PL4cUxeGkcC9joeiiVaLExvfSgmdtBbSPM)
- [Claude Code Tutorial](https://www.youtube.com/playlist?list=PL4cUxeGkcC9g4YJeBqChhFJwKQ9TRiivY)

The code is certainly less organized and less efficient than if it was written by a human from scratch, but it's not unmanageable, and it does seem to work OK.  I would probably have a much stronger opinion on that if was a Javascript programmer. :-)
