import { Logger, logger } from './logging';
import { showAndLogErrorMessage, showAndLogWarningMessage, getDockerPath, getCurrentFolder } from './helpers';
import * as child_process from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { fstat, existsSync } from 'fs';

let SUPPORT_LANGUAGES = ['cpp', 'csharp', 'go', 'java', 'javascript', 'python', 'ruby'];
let OUTPUT_FOLDER = 'codeql-agent-result';
let LANGUAGE = 'python';



export async function executeCommand(
    commandPath: string,
    // command: string[],
    commandArgs: string[],
    description: string,
    logger: Logger
): Promise<number> {
    // Add logging arguments first, in case commandArgs contains positional parameters.
    // const args = command.concat(commandArgs);
    const args = commandArgs;
    const argsString = args.join(' ');
    try {
        void logger.log(`${description} using CodeQL Agent CLI: ${commandPath} ${argsString}...`);
        // const result = await promisify(child_process.execFile)(commandPath, args, {shell: true});
        const result = child_process.execFile(commandPath, args, {shell: true});
        result.stdout?.on('data', function(data) {
            logger.log(data);
        });
        result.stderr?.on('data', function(data) {
            logger.log(data);
        });

        // result.on('close', function(code) {
        //     logger.log('Exit code: ' + code);
        //     if (code !== null) {
        //         exitCode = code;
        //     }
        // });

        const exitCode: number = await new Promise( (resolve, reject) => {
            result.on('close', resolve);
        });
        // void logger.log((await result).stderr);
        // void logger.log((result.stdout);
        void logger.log('Run command succeeded.');
        return exitCode;
    } catch (err: any) {
        let error = new Error(`${description} failed: ${err.stderr || err}`);
        showAndLogErrorMessage(`${error.name}: ${error.message}`);
        throw error;
    }
}



export async function scan(src?: string, language?: string): Promise<boolean> {
    let dockerPath = await getDockerPath();
    // let command = ['run', 'codeql-agent'];
    let args = [];
    language = LANGUAGE;

    // Add command docker
    args.push('run');

    // Add remove option
    args.push('--rm');

    // Add container name
    args.push(
        '--name',
        'codeql-agent-docker'
    );

    // Get source path
    if (!src) {
      src = await getCurrentFolder();
    }

    if (existsSync(src)) {
        args.push(
            '-v',
            '"/tmp:/opt/src"'
        );
    } else {
      showAndLogErrorMessage(`Could not found scan path: ${src}`);
      return false;
    }

    // Set output
    args.push(
      '-v',
      `"${OUTPUT_FOLDER}:/opt/results"`
    );

    // Set language
    if (language && (language !== undefined)) {
        if (SUPPORT_LANGUAGES.includes(language)) {
            args.push(
                '-e',
                `"LANGUAGE=${language}"`
            );
        } else {
            // vscode.window.showErrorMessage('The language are not supported. Support language list: ' + SUPPORT_LANGUAGES.join(', '));
            showAndLogErrorMessage('The language are not supported. Support language list: ' + SUPPORT_LANGUAGES.join(', '));
            return false;
        }
    } else {
      // vscode.window.showErrorMessage('The language are not supported. Support language list: ' + SUPPORT_LANGUAGES.join(', '));
      showAndLogErrorMessage('Please specify the language');
      return false;
  }

    // Set FORMAT
    args.push(
      '-e',
      '"FORMAT=sarif-latest"'
    );

    // Set docker image
    args.push('codeql-agent');
    await executeCommand(dockerPath, args, 'Codeql scan', logger);


    return true;
}

