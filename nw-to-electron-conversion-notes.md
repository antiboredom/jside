## Overview:

I'm pretty sure this will require Node Version 4+. Tested on Node V6

Based off the electron-boilerplate-vue template at https://github.com/bradstewart/electron-boilerplate-vue. I forked from the p5.js editor repo, merged this PR https://github.com/processing/p5.js-editor/pull/239 into my branch, deleted pretty much everything and started from scratch building things up to get features working on electron.

I'd say it's almost there but there are some issues. There are some features that I haven't completed yet that I am aware of and some bugs that may exist that I am not aware of but I think a lot of the changes fix current open issues.

I tried to stick to the same logic as much as possible from the original nw.js branch. I had to change or modify the logic in certain areas as electron does everything in separate processes and has a completely different architecture.

## Why the p5.js editor is better with electron and the boilerplate I used (rather than nw.js)

- Audio issues are fixed. Electron already has support for proprietary audio codecs. No need to copy in custom FFmpeg libraries.
- More active community
- Electron better documented
- Built from scratch on new tech like webpack, vue-loader and ES6 etc.
- No need for nodeRequire. Electron unifies the contexts so you can just 'require' everything

## Some feature changes from nwjs branch

- For some reason, the menu code only allowed mac users to add libraries and use the serialport server amongst other things so now all platforms can do these things.
- Should have fixed some serial server issues (hopefully)

## Some technical changes

- Big architectural change. Windows share namespace in nw.js. In Electron, you have the main process and renderer process(es). The renderer processes are the browser windows and the main process is a background process that runs throughout the lifetime of the app. You usually have to create BrowserWindows from the main thread to minimise memory leakage (also need to be careful about where callbacks are made). You can use the 'remote' module to do simple IPC (Inter-process Communication) or use the IPC modules to be more explicit and get more flexibility.
- I think Electron's architecture is superior to nw.js's but it was a bit of a headache to convert.
- Based on the boilerplate, I put the JavaScript, styles and html of each component in a single .vue component. I don't know what people's opinions of this are but I was just getting it to work with the default config

## Issues I'm aware of / things I haven't implemented back in yet:

- Debug console permanently vertical
- Save window state on exit and reopen with state
- Close handler for editor - check about files still open etc.
- Handle errors better (done a lot of 'if (err) throw err')
- Make sure releases and packages work as expected - make sure to get icons
- Fix references to the ACE editor in VUE components
- Check for instances of prompt() and replace with a working function as Electron 'Will never support prompt()'
- Serial controlling - DONE - dependecy issues with webpack though. Currently put it as a devDependency in the root package.json and externalising via webpack config when it should really be in the app/package.json dependencies I think. I opened an issue here: https://github.com/bradstewart/electron-boilerplate-vue/issues/31
- Lingering node process after app.quit(). Strangely doesn't seem to occur if ctrl+c to end. This casuses an EADDRINUSE error when trying to run the webpack dev server again. Just `killall node` and try again.
- Vue hot loading currently doesn't work properly. The whole page reloads. This is an open issue on the electron vue boilerplate project https://github.com/bradstewart/electron-boilerplate-vue/issues/19

### Non-essential:
- Convert callback hell (e.g. menu.js) to promise-style async for readability
- Convert requires to ES6 imports and other ES6 conversions
- Vue dev tools not opening (seem to work when show: true specified on winSettings for BrowserWindow)
- Separate the debug-console.js file into cycle.js and debug-client.js