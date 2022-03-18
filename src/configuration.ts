import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { getCurrentFolder, showAndLogErrorMessage, showAndLogWarningMessage } from './helpers';
import { fstat, existsSync } from 'fs';
export let SUPPORT_LANGUAGES = ['cpp', 'csharp', 'go', 'java', 'javascript', 'python', 'ruby'];
export let OUTPUT_FOLDER = 'codeql-agent-results';
export let DOCKER_CONTAINER_NAME = 'codeql-agent-docker';
/**
 * Displays file selection dialog. Expects the user to choose a
 * database directory, which should be the parent directory of a
 * directory of the form `db-[language]`, for example, `db-cpp`.
 *
 * XXX: no validation is done other than checking the directory name
 * to make sure it really is a database directory.
 */
export async function chooseProjectFolder(byFolder: boolean = true): Promise<vscode.Uri | undefined> {
    const chosen = await vscode.window.showOpenDialog({
        openLabel: byFolder ? 'Choose Database folder' : 'Choose Database archive',
        canSelectFiles: !byFolder,
        canSelectFolders: byFolder,
        canSelectMany: false,
        filters: byFolder ? {} : { Archives: ['zip'] },
    });
    return getFirst(chosen);
}

/** Gets the first element in the given list, if any, or undefined if the list is empty or undefined. */
function getFirst(list: vscode.Uri[] | undefined): vscode.Uri | undefined {
    if (list === undefined || list.length === 0) {
        return undefined;
    } else {
        return list[0];
    }
}


class ProjectConfiguration {
    sourcePath: string | undefined = undefined;
    outputPath: string | undefined = undefined;
    overwrite: boolean = true;
    language: string | undefined = undefined;
    dockerPath: string = 'docker';

    async setSourcePath(sourcePath: Uri | undefined): Promise<boolean> {
        if (sourcePath === undefined) {
            this.sourcePath = undefined;
            return true;
        }
        if (!existsSync(sourcePath.path)) {
            showAndLogErrorMessage("Invalid source path or source path does not exists.");
            return false;
        } else {
            this.sourcePath = sourcePath.path;
            return true;
        }
    }

    async getSourcePath(): Promise<string> {
        if (this.sourcePath === undefined || this.sourcePath === '') {
            this.sourcePath = await getCurrentFolder();
        }
        if (this.sourcePath === '' || !existsSync(this.sourcePath)) {
            let error = new Error(`Invalid source path or source path does not exists: ` + this.sourcePath);
            showAndLogErrorMessage(`${error.name}: ${error.message}`);
            throw error;
        }
        return this.sourcePath;
    }

    async getLanguage(): Promise<string | undefined> {
        let configLanguage: string | undefined = vscode.workspace.getConfiguration().get('codeql-agent.project.language');
        if (configLanguage === "Auto detect") {
            return undefined;
        } else { return configLanguage; };
    }

    async getOutputPath(): Promise<string | undefined> {
        let configOutputPath: string | undefined = vscode.workspace.getConfiguration().get('codeql-agent.project.outputPath');
        if (configOutputPath !== undefined && existsSync(configOutputPath)) {
            return configOutputPath;
        } else { return undefined; };
    }

    async getOverwriteFlag(): Promise<boolean> {
        let configOverwriteFlag: boolean | undefined = vscode.workspace.getConfiguration().get('codeql-agent.project.overwriteFlag');
        if (configOverwriteFlag === undefined) { return false; };
        return configOverwriteFlag;
    }

    async getDockerPath(): Promise<string> {
        let configDockerPath: string | undefined = vscode.workspace.getConfiguration().get('codeql-agent.cli.dockerExecutablePath');
        if (configDockerPath !== undefined && configDockerPath !== '') {
            if (existsSync(configDockerPath)) {
                this.dockerPath = configDockerPath;
            } else {
                showAndLogErrorMessage("Can not found Docker executable path.");
            }
        } 
        return this.dockerPath;
    }
}

export let projectConfiguration = new ProjectConfiguration();
