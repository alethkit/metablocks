# metablocks

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

loading back state:

copypaste `dump.json` contents into console as var `dump`

```js
p = await window.playground;
w = await p.getWorkspace();
Blockly.serialization.workspaces.load(dump,w)

```
