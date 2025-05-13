#!/usr/bin/env node

import * as ts from "typescript";

// Cannot use __basepath because we have "type": "module" in package.json
const basepath = process.argv[1].slice(0, process.argv[1].lastIndexOf('/'));
const ignorePaths = [`${basepath}/node_modules`, `${basepath}/pkg`];

/**
 * @param {string} filePath
 * @returns {boolean}
 */
const shouldIgnore = (filePath) => {
    for (const path of ignorePaths) {
        if (filePath.startsWith(path))
            return true;
    }

    return false;
}

/**
 * @param {string[]} fileNames
 * @param {ts.CompilerOptions} options
 */
function checkTypes(fileNames, options) {
    const program = ts.createProgram(fileNames, options);
    const emitResult = program.emit();
    let success = true;

    const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            if (shouldIgnore(diagnostic.file.fileName)) {
                return;
            }
            const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            const fileName = diagnostic.file.fileName.replace(basepath + '/', '');
            console.log(`${fileName}:${line + 1}:${character + 1}:\n${message}\n`);
            success = false;
        } else {
            console.log("Unknown diagnostic error:");
            console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            success = false;
        }
    });

    const exitCode = success ? 0 : 1;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}

const { config } = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const tsConfig = ts.parseJsonConfigFileContent(config, ts.sys, basepath);
// Make sure this script never emits anything
tsConfig.options.noEmit = true

checkTypes(tsConfig.fileNames, tsConfig.options);
