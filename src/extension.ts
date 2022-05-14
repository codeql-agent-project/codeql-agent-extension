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
	extensions,
	Uri
} from 'vscode';

import { resolve } from 'path';
import { scan, cleanDockerContainer } from './cli';
import { getCurrentFolder, showAndLogErrorMessage, showAndLogWarningMessage } from './helpers';
import { chooseProjectFolder, projectConfiguration } from './configuration';
export function activate(context: vscode.ExtensionContext) {


	console.log('Codeql Agent is now active!');

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
			let resultPath = await projectConfiguration.getSARIFResultPath();
			openSarifViewerPannel(resultPath)
			vscode.window.showInformationMessage("Scanning complete");
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
			let resultPath = await projectConfiguration.getSARIFResultPath();
			openSarifViewerPannel(resultPath)
			vscode.window.showInformationMessage("Scanning complete");
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
			vscode.window.showInformationMessage("Create database complete");
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
			vscode.window.showInformationMessage("Create database complete");
		});
	}));

	// go-to-settings
	context.subscriptions.push(commands.registerCommand('codeql-agent.go-to-settings', async () => {
		vscode.commands.executeCommand( 'workbench.action.openSettings', 'codeql-agent' );
	}));
}

async function openSarifViewerPannel(filePath: string){
	const sarifExt = extensions.getExtension('MS-SarifVSCode.sarif-viewer');
	if (sarifExt === undefined) {
		vscode.window.showWarningMessage("Please install 'Sarif Viewer' to view SAST report better.", ...['Install'])
		.then(install => {
			if (install === "Install"){
				commands.executeCommand('workbench.extensions.installExtension', 'MS-SarifVSCode.sarif-viewer');
			}
		});
		return false;
	}
	if (!sarifExt.isActive) await sarifExt.activate();
	await sarifExt.exports.openLogs([
		Uri.file(filePath),
	]);
	return true;
}

// this method is called when your extension is deactivated
export function deactivate() { }
