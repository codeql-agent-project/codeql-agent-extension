
<h1 align="center"> CodeQL Agent <img src="media/icon-marketplace.png" alt="drawing" width="50" height="50"/></h1>

<div align="center">





[![Version](https://vsmarketplacebadge.apphb.com/version/DoubleVKay.codeql-agent.svg)](https://marketplace.visualstudio.com/items?itemName=DoubleVKay.codeql-agent)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/DoubleVKay.codeql-agent.svg)](https://marketplace.visualstudio.com/items?itemName=DoubleVKay.codeql-agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/IBM-Bluemix/vscode-log-output-colorizer/master/LICENSE)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating-star/DoubleVKay.codeql-agent.svg)](https://vsmarketplacebadge.apphb.com/rating-star/DoubleVKay.codeql-agent.svg)

*An extension for Visual Studio Code that simplifies the usage of CodeQL*

![codeql-agent-demo](media/codeql-agent-demo.gif)


</div>

> This project is an extension for Visual Studio Code that simplifies the usage of CodeQL and helps execute code scanning automatically.

### Contents:
  - [Features](features)
  - [What is this for?](#what-is-this-for)
  - [Installation](#installation)
  - [Requiremennts](#requirements)
  - [Getting started](#getting-started)
  - [Usage](#usage)
    - [Execute CodeQL code scanning](#execute-codeql-code-scanning)
    - [Automize creating CodeQL database](#automize-creating-codeql-database)
    - [Integrate CodeQL into GitLab CI/CD](#integrate-codeql-into-gitlab-cicd)
  - [Configuration](#configuration)
  - [How does it work?](#how-does-it-work)
  - [Support](#support)
  - [Contributing](#contributing)
  - [Contributors](#contributors)
  - [Release notes](#release-notes)
  - [License](#license)

## Features

Here are some of the features that CodeQL Agent provides:

- Execute CodeQL code scanning.
- Automize creating CodeQL database.
- Integrate CodeQL into [GitLab CI/CD](https://docs.gitlab.com/ee/ci/).

## What is this for?
The extension is helpful for those who need:
- Scanning your source code to check for known vulnerabilities.
- Creating CodeQL database automatically to reduce the frustrating of the CodeQL usage.
- Setting up [Gitlab CI/CD](https://docs.gitlab.com/ee/ci/) to apply [static application security testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/) for DevSecOps process.


## Installation

In Visual Studio Code, you can install CodeQL Agent on **Extensions View** (Ctrl + Shift + X) or you can download it from [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=DoubleVKay.codeql-agent)

Before running CodeQL Agent, please make sure that you are checked the [Requirements](#Requirements).


## Requirements

CodeQL Agent based on [Docker](https://www.docker.com/). Executing CodeQL Agent requires **root** privilege (open Visual Studio Code with root) or **Docker Management** privilege (see [Manage Docker as a non-root user](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user) for more details).

Please install [SARIF Viewer](https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer) to view SARIF results. 

You also can install [Output Colorizer](https://marketplace.visualstudio.com/items?itemName=IBM.output-colorizer) (optional) to colorize the output log. 


## Getting started

1. Open your source code in Visual Studio Code.
2. Click the **Scan** button on the extension view panel.
3. CodeQL Agent executes code scanning automatically. It will take some time for the first time run (see [How does it work?](#how-does-it-work)).
4. The results of code scanning will display on the **SARIF Viewer panel**.


## Usage

### Execute CodeQL code scanning

 Click the **Scan** button to execute code scanning at your current folder. You also can choose other source code to scan by click the **Scan folder** button.

The results of code scanning are stored at `codeql-agent-results` folder. It includes:
- `codeql-db` folder: the codeql database built from the source code
- `gl-sast-report.json`: the [Gitlab SAST Security Report Schemas](https://gitlab.com/gitlab-org/security-products/security-report-schemas) format result file.
- `issues.sarif`: the SARIF format result file. 

After code scanning is complete, The SARIF Viewer Panel will pop up automaticlly if it's already installed. Otherwise, please install [SARIF Viewer](https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer) then click to the `issues.sarif` file to view the results. 

### Automize creating CodeQL database

 Click the **Build database** button to build CodeQL database at your current folder. You also can choose other source code to scan by click the **Builld database from** button.

 The created CodeQL database are stored at `codeql-agent-results/codeql-db`.

### Integrate CodeQL into GitLab CI/CD

![codeql-agent-gitlab-demo](media/codeql-agent-gitlab-demo.gif)


You can integrate CodeQL into Gitlab CI/CD by setting up the `.gitlab-ci.yml` file with the following template:

```yaml
codeql:
  image: doublevkay/codeql-agent-dev:latest
  script: /root/scripts/analyze.sh
  artifacts:
    reports:
      sast: gl-sast-report.json
```

*This is the feature of **CodeQL Agent for Docker**. For more details and customization, please see [CodeQL Agent for Docker](https://github.com/vovikhangcdv/codeql-agent).*
 

## Configuration

Click **Settings** button to move on to extensions setting panel. This extension supports the following settings:

| Option  | Description |
| ------- | ----------- |
`cli.dockerExecutablePath` | Set path to the Docker executable that should be used by the CodeQL extension. If empty, the extension will look for a Docker executable on your shell PATH, or if Docker is not on your PATH, download and manage its own Docker executable.
`project.outputPath` | Set path to the output folder. Please enter full path. Default is *`${currentProjectPath}/codeql-agent-results`*
`project.overwriteFlag` | Enable/disable overwrite database when database path is exists and not an empty directory. This flag is useful for forcely rebuild database.
`project.language` | Set project language to building database or execute SAST.
`project.threads` | Use this many threads to build database and evaluate queries. Defaults to 1. You can pass 0 to use one thread per core on the machine.
`project.saveCache` | Aggressively save intermediate results to the disk cache. This may speed up subsequent queries if they are similar. Be aware that using this option will greatly increase disk usage and initial evaluation time.

## How does it work?
This extension is the interface of [CodeQL Agent for Docker](https://github.com/vovikhangcdv/codeql-agent) which is a docker image that helps execute CodeQL automatically.

At the first time run, the CodeQL Agent extension pulls the docker image `doublevkay/codeql-agent-dev` to the local machine. A docker container will be created and run with the [options set by the user](#configuration).

## Support

You can open an issue on the [GitHub repo](https://github.com/vovikhangcdv/codeql-agent-extension)

## Contributing

Contributions are always welcome! Just simply create merge request or contact me  <a href="https://twitter.com/doublevkay">
    <img src="https://img.shields.io/twitter/url?style=for-the-badge&label=%40doublevkay&logo=twitter&logoColor=00AEFF&labelColor=black&color=7fff00&url=https%3A%2F%2Ftwitter.com%2Fdoublevkay">  </a>

## Contributors
<a href="https://github.com/vovikhangcdv/codeql-agent-extension/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vovikhangcdv/codeql-agent-extension" />
</a>

## Release Notes

[See details](https://github.com/vovikhangcdv/codeql-agent-extension/releases)

## License

CodeQL Agent is licensed under the [MIT license](https://github.com/vovikhangcdv/codeql-agent-extension/blob/main/LICENSE).
