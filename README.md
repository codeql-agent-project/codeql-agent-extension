# CodeQL Agent for Visual Studio Code

This project is a extension for Visual Studio Code that simplifies the use of CodeQL. It's written primarily in TypeScript.

The extension is released. You can download it from the Visual Studio Marketplace.

## Features

- Automize building CodeQL database
- Quick execute SAST.

## Requirements

Please install [SARIF Viewer](https://github.com/microsoft/sarif-vscode-extension) to view SARIF results better.

## Extension Settings

This extension contributes the following settings:

* `codeql-agent.cli.dockerExecutablePath`: set path to the Docker executable that should be used by the CodeQL extension. If empty, the extension will look for a Docker executable on your shell PATH, or if Docker is not on your PATH, download and manage its own Docker executable.
* `codeql-agent.project.outputPath`: set path to the output folder. Please enter full path. Default is *${currentProjectPath}/codeql-agent-results*
* `codeql-agent.project.overwriteFlag`: enable/disable overwrite database when database path is exists and not an empty directory. This flag is useful for forcely rebuild database.
* `codeql-agent.project.language`: set project language to buidling database or execute SAST.

## Release Notes

### 1.0.0

Initial release of CodeQL Agent

**Enjoy!**
