// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { logger } from './logging';
import { buildDatabase, executeCommand } from './cli';
import {
	commands,
	ProgressLocation,
	window as Window,
	window,
} from 'vscode';

import { resolve } from 'path';
import { scan, cleanDockerContainer } from './cli';
import { getCurrentFolder, showAndLogErrorMessage, showAndLogWarningMessage } from './helpers';
import { chooseProjectFolder, projectConfiguration } from './configuration';
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeql-agent" is now active!');
	checkRequirement();

	// scan-folder
	context.subscriptions.push(commands.registerCommand('codeql-agent.scan-folder', async () => {
		let projectFolder = await chooseProjectFolder();
		if (!projectFolder) {return;};
		await projectConfiguration.setSourcePath(projectFolder);
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
			await projectConfiguration.setSourcePath(undefined); // Reset sourcePath
			checkRequirement();

		});
	}));

	// scan
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
			checkRequirement();
		});
	}));

	// build-database
	context.subscriptions.push(commands.registerCommand('codeql-agent.build-database', async () => {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: `Build database from folder ${await projectConfiguration.getSourcePath()} ...` ,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				cleanDockerContainer();
				console.log("User canceled the long running operation");
			});

			await buildDatabase();

		});
	}));

	// build-database-folder
	context.subscriptions.push(commands.registerCommand('codeql-agent.build-database-folder', async () => {
		let projectFolder = await chooseProjectFolder();
		if (!projectFolder) {return;};
		await projectConfiguration.setSourcePath(projectFolder);
		window.withProgress({
			location: ProgressLocation.Notification,
			title: `Build database from folder ${await projectConfiguration.getSourcePath()} ...` ,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				cleanDockerContainer();
				console.log("User canceled the long running operation");
			});
			await buildDatabase();
			await projectConfiguration.setSourcePath(undefined); // Reset sourcePath
		});
	}));

	// go-to-settings
	context.subscriptions.push(commands.registerCommand('codeql-agent.go-to-settings', async () => {
		vscode.commands.executeCommand( 'workbench.action.openSettings', 'codeql-agent' );
	}));
}


function checkRequirement() {
	// Check dependency extension: MS-SarifVSCode.sarif-viewer
	let sarifViewer = vscode.extensions.getExtension('MS-SarifVSCode.sarif-viewer');
	if (sarifViewer === undefined) {
		vscode.window.showWarningMessage("Please install 'Sarif Viewer' to view SAST report better.", ...['Install'])
		.then(install => {
			if (install === "Install"){
				commands.executeCommand('workbench.extensions.installExtension', 'MS-SarifVSCode.sarif-viewer');
			}
		});
	}

	return true;
}



// this method is called when your extension is deactivated
export function deactivate() { }
