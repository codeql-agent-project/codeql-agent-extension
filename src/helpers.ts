import {
    ExtensionContext,
    Uri,
    window as Window,
    workspace,
    env
} from 'vscode';
import * as vscode from 'vscode';
import { logger } from './logging';
import * as fs from 'fs';
/**
 * Show an error message and log it to the console
 *
 * @param message The message to show.
 * @param options.outputLogger The output logger that will receive the message
 * @param options.items A set of items that will be rendered as actions in the message.
 * @param options.fullMessage An alternate message that is added to the log, but not displayed
 *                           in the popup. This is useful for adding extra detail to the logs
 *                           that would be too noisy for the popup.
 *
 * @return A promise that resolves to the selected item or undefined when being dismissed.
 */
export async function showAndLogErrorMessage(message: string, {
    outputLogger = logger,
    items = [] as string[],
    fullMessage = undefined as (string | undefined)
} = {}): Promise<string | undefined> {
    return internalShowAndLog(dropLinesExceptInitial(message), items, outputLogger, Window.showErrorMessage, fullMessage);
}

function dropLinesExceptInitial(message: string, n = 2) {
    return message.toString().split(/\r?\n/).slice(0, n).join('\n');
}

type ShowMessageFn = (message: string, ...items: string[]) => Thenable<string | undefined>;

async function internalShowAndLog(
    message: string,
    items: string[],
    outputLogger = logger,
    fn: ShowMessageFn,
    fullMessage?: string
): Promise<string | undefined> {
    const label = 'Show Log';
    void outputLogger.log(fullMessage || message);
    const result = await fn(message, label, ...items);
    if (result === label) {
        // outputLogger.show();
    }
    return result;
}

/**
 * Show a warning message and log it to the console
 *
 * @param message The message to show.
 * @param options.outputLogger The output logger that will receive the message
 * @param options.items A set of items that will be rendered as actions in the message.
 *
 * @return A promise that resolves to the selected item or undefined when being dismissed.
 */
export async function showAndLogWarningMessage(message: string, {
    outputLogger = logger,
    items = [] as string[]
} = {}): Promise<string | undefined> {
    return internalShowAndLog(message, items, outputLogger, Window.showWarningMessage);
}



export async function getCurrentFolder(): Promise<string> {
    if (vscode.workspace.workspaceFolders !== undefined) {
        return vscode.workspace.workspaceFolders[0].uri.path;
    }
    return '';    
}

export async function fixSchema(schemaPath: string): Promise<boolean> {
    const fs = require('fs');
    const fileName = schemaPath;
    const file = require(fileName);
        
    file.$schema = "http://json.schemastore.org/sarif-2.1.0-rtm.4";
        
    fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err: Error) {
      if (err) {return console.log(err)};
      console.log(JSON.stringify(file));
    });
    return true;
}