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

import {
	commandRunner,
	commandRunnerWithProgress,
	ProgressCallback,
	withProgress,
	ProgressUpdate
  } from './commandRunner';
import { resolve } from 'path';
import { scan } from './cli';

export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeql-agent" is now active!');

	context.subscriptions.push(commands.registerCommand('codeql-agent.scan', () => {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "Scaning!",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			// progress.report({ increment: 0 });

			// setTimeout(() => {
			// 	progress.report({ increment: 10, message: "I am long running! - still going..." });
			// }, 1000);

			// setTimeout(() => {
			// 	progress.report({ increment: 40, message: "I am long running! - still going even more..." });
			// }, 2000);

			// setTimeout(() => {
			// 	progress.report({ increment: 50, message: "I am long running! - almost there..." });
			// }, 3000);
			// await executeCommand('/usr/bin/sleep', ['10'], 'Run touch', logger);

			// const p = new Promise<void>(resolve => {
			// 	setTimeout(() => {
			// 		resolve();
			// 	}, 5000);
			// });
			await scan();
			// const p = new Promise<void>(resolve => resolve());
			// return p;
		});
	}));

}


function checkRequirement(){
	return true;
}



// this method is called when your extension is deactivated
export function deactivate() {}
