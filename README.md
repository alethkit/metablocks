# metablocks


## Getting Started



To install dependencies:

```bash
bun install
```

To build bundle (Necessary until we're done with the Advanced Playground:)

```bash
bun run build
```


To run:

```bash
bun run start
```


## Saving and Loading
loading back state:

copypaste `dump.json` contents into console as var `dump`

```js
p = await window.playground;
w = await p.getWorkspace();
Blockly.serialization.workspaces.load(dump,w)

```

In order to avoid mucking about with the fetch API, it is probably easiest to copypaste the relevant dump into local storage.

Chromium: dev tools -> application -> storage -> Local Storage -> <url being used to host>
Firefox: dev tools -> storage -> Local Storage

create a new variable, and dump the contents of the JSON file into it.

Assume the new local storage entry is called `foobar`:

```js
foobar_loaded  = JSON.parse(localStorage.getItem("foobar"));
Blockly.serialization.workspaces.load(foobar_loaded,window.ws);
```

In order to save:

```js
foobar_saved = Blockly.serialization.workspaces.save(window.ws);
localStorage.setItem("foobar",JSON.stringify(foobar_saved));
```
