// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) { 
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('tsformatter.format', (args) => {
        // The code you place here will be executed every time your command is executed        
        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        if (args.context.editorLangId !== "typescript") {
            vscode.commands.executeCommand("editor.action.format");

            return;
        }
        
        let projectPath = vscode.workspace.rootPath;
        let filepath = editor.document.fileName;
        let channel = vscode.window.createOutputChannel("TypeScript Formatter");
        
        // TODO: Build default config with --stdin option https://github.com/vvakame/typescript-formatter

        //Warning: The tsfmt CLI doesn't accept quotes in filepath. Quotes are omitted in the next line on purpose.
        let exec = cp.exec(`echo 'Formatting TS file at ${filepath}.' && tsfmt ${filepath} -r`, { cwd: projectPath, env: process.env }, (error) => {
            if(!error){
                channel.hide();
                
                return;
            };
            
            vscode.window.showErrorMessage("Failed to format document. See output window for details.");
        });

        exec.stderr.on("data", (data: string) => {
            channel.append(data);
        });

        exec.stdout.on("data", (data: string) => {
            channel.append(data);
        });

        channel.show(vscode.ViewColumn.Three);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}