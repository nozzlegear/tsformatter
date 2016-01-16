# tsformatter

A small VSCode extension that formats TypeScript files using [tsfmt](https://github.com/vvakame/typescript-formatter). To control the format options, place a [`tsformat.json`](https://github.com/vvakame/typescript-formatter#read-settings-from-files) file in the current project's root directory.

(Note that this extension currently ignores editorconfig and tslint.json files.)

## Installation

Clone this repository, then install the required node modules:

```bash
npm install
```

After that, use the VSCode command prompt to install the extension:

```bash
code tsformatter-1.0.0.vsix
```

## TODO

- [ ] Read tsformat.json settings from VSCode settings, which can then be overridden by a tsformat.json file.