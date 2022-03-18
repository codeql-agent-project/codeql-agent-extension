import { Logger, logger } from './logging';
import { showAndLogErrorMessage, showAndLogWarningMessage, getCurrentFolder } from './helpers';
import * as child_process from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { projectConfiguration, DOCKER_CONTAINER_NAME, OUTPUT_FOLDER, SUPPORT_LANGUAGES } from './configuration';
import { outputFile } from 'fs-extra';

// let LANGUAGE = 'python';
let OVERWRITE_FLAG = false;


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
        const result = child_process.execFile(commandPath, args, { shell: true });
        result.stdout?.on('data', function (data) {
            logger.log(data);
        });
        result.stderr?.on('data', function (data) {
            logger.log(data);
        });

        // result.on('close', function(code) {
        //     logger.log('Exit code: ' + code);
        //     if (code !== null) {
        //         exitCode = code;
        //     }
        // });

        const exitCode: number = await new Promise((resolve, reject) => {
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


export async function cleanDockerContainer() {
    let dockerPath = await projectConfiguration.getDockerPath();
    let args = [];

    args.push(
        'rm',
        '-f',
        DOCKER_CONTAINER_NAME
    );

    await executeCommand(dockerPath, args, 'Clean up docker container', logger);
}

async function setupArgs(action?: string): Promise<string[] | undefined> {
    let args = [];

    // Add command docker
    args.push('run');

    // Add remove option
    args.push('--rm');

    // Add container name
    args.push(
        '--name',
        DOCKER_CONTAINER_NAME
    );

    let src = await projectConfiguration.getSourcePath();
    args.push(
        '-v',
        `"${src}:/opt/src"`
    );

    // Check if overwrite database
    if (OVERWRITE_FLAG) {
        args.push('-e', '--overwrite');
    }
    // Set output
    let outputPath = await projectConfiguration.getOutputPath();
    if (outputPath === undefined) {
        outputPath = `${await getCurrentFolder()}/${OUTPUT_FOLDER}`;  
    }
    await executeCommand('mkdir', [outputPath], 'Create output folder', logger);
    args.push(
        '-v',
        `"${outputPath}:/opt/results"`
    );

    // Set overwrite flag
    let overwriteFlag = await projectConfiguration.getOverwriteFlag();
    if (overwriteFlag === true) {
        args.push(
            '-e',
            `"OVERWRITE_FLAG=--overwrite"`
        );
    }


    // Set language
    let language = await projectConfiguration.getLanguage();
    if (language && (language !== undefined)) {
        if (SUPPORT_LANGUAGES.includes(language)) {
            args.push(
                '-e',
                `"LANGUAGE=${language}"`
            );
        } else {
            // vscode.window.showErrorMessage('The language are not supported. Support language list: ' + SUPPORT_LANGUAGES.join(', '));
            showAndLogErrorMessage('The language are not supported. Support language list: ' + SUPPORT_LANGUAGES.join(', '));
            return undefined;
        }
    }

    // Set FORMAT
    args.push(
        '-e',
        '"FORMAT=sarif-latest"'
    );

    // Set ACTION
    if (action) {
        args.push(
            '-e',
            '"ACTION=create-database-only"'
        );
    }


    // Set docker image
    args.push('doublevkay/codeql-agent-dev');

    return args;
}

export async function scan(): Promise<boolean> {
    await cleanDockerContainer();

    let dockerPath = await projectConfiguration.getDockerPath();
    // let command = ['run', 'codeql-agent'];
    let args = await setupArgs();

    logger.show();
    if (dockerPath && args && logger) {
        await executeCommand(dockerPath, args, 'Codeql scan', logger);
    }

    return true;
}

export async function buildDatabase(): Promise<boolean> {
    await cleanDockerContainer();

    let dockerPath = await projectConfiguration.getDockerPath();
    // let command = ['run', 'codeql-agent'];
    let args = await setupArgs("create-database-only");

    logger.show();
    if (dockerPath && args && logger) {
        await executeCommand(dockerPath, args, 'Codeql build database', logger);
    }

    return true;
}
