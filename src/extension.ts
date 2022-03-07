// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { logger } from './logging';
import { executeCommand } from './cli';
import {
	CancellationToken,
	CancellationTokenSource,
	commands,
	Disposable,
	ExtensionContext,
	extensions,
	languages,
	ProgressLocation,
	ProgressOptions,
	Uri,
	window as Window,
	env,
	window,
	QuickPickItem,
	Range,
	workspace,
	ProviderResult
} from 'vscode';

import { resolve } from 'path';
import { scan, cleanDockerContainer } from './cli';
import { showAndLogErrorMessage } from './helpers';
import { chooseProjectFolder, projectConfiguration } from './configuration';
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeql-agent" is now active!');

	context.subscriptions.push(commands.registerCommand('codeql-agent.scan-folder', async () => {
		await projectConfiguration.setSourcePath(await chooseProjectFolder());
		let byFolder = true;
		window.withProgress({
			location: ProgressLocation.Notification,
			title: `Scaning folder ${await projectConfiguration.getSourcePath(byFolder)} ...` ,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				cleanDockerContainer();
				console.log("User canceled the long running operation");
			});
			await scan(true);

		});
	}));

	context.subscriptions.push(commands.registerCommand('codeql-agent.scan', async () => {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: `Scaning folder ${await projectConfiguration.getSourcePath()} ...` ,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				cleanDockerContainer();
				console.log("User canceled the long running operation");
			});

			await scan();

		});
	}));

}


function checkRequirement() {
	return true;
}



// this method is called when your extension is deactivated
export function deactivate() { }
