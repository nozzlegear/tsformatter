// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from "path";
import * as tsfmt from "typescript-formatter";
import * as Bluebird from "bluebird";
import * as fs from "fs";
import {merge} from "lodash";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{ 
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('tsformatter.format', (args) =>
    {
        // The code you place here will be executed every time your command is executed        
        const editor = vscode.window.activeTextEditor;
        const filename = editor.document.fileName;
        const hasUnsavedEdits = editor.document.isDirty;

        if (!editor || !vscode.workspace.rootPath)
        {
            return;
        }

        if (args.context.editorLangId !== "typescript")
        {
            vscode.commands.executeCommand("editor.action.format");

            return;
        }

        const format = (saved: boolean) => 
        {
            if (!saved && hasUnsavedEdits)
            {
                vscode.window.showErrorMessage("Failed to save document before ts format.");

                throw "Failed to save document when it has unsaved edits.";

                return;
            }

            let projectPath = vscode.workspace.rootPath;
            let content = editor.document.getText();
            let defaults: tsfmt.Options =
                {
                    dryRun: false,
                    verbose: true,
                    baseDir: projectPath,
                    replace: false,
                    verify: false,
                    tsconfig: false,
                    tslint: false,
                    editorconfig: false,
                    tsfmt: true
                };

            return tsfmt.processString(filename, content, defaults);
        };

        const getResult = (result: tsfmt.Result) => 
        {
            let resultMap: tsfmt.ResultMap = {};

            resultMap[result.fileName] = result;

            return resultMap;
        };

        const completeFormat = (resultMap: tsfmt.ResultMap) => 
        {
            const edit = resultMap[filename];
            let error = edit.error;

            if (error) 
            {
                throw "TSFMT failed to format file.";

                return;
            }

            const formattedFile = resultMap[filename].message;

            return editor.edit((editBuilder) => 
            {
                let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
                let range = new vscode.Range(0, 0, lastLine.range.end.line, lastLine.range.end.character);

                editBuilder.replace(range, formattedFile);
            });
        };

        const handleError = (error: any) => 
        {
            if (error instanceof Error)
            {
                console.error(error.stack);
            }
            else
            {
                console.error(error);
            }

            vscode.window.showErrorMessage("Failed to format document. Error: ", error);

            return;
        };
        
        //Save, find config file, create options and format.
        Bluebird.resolve(editor.document.save())
            .then(format)
            .then(getResult)
            .then(completeFormat)
            .catch(handleError);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate()
{
}
