import * as vscode from "vscode";

const md = require('markdown-it')();

export default class Preview {
  private disposables: vscode.Disposable[] = [];
  private panel: vscode.TextDocument | null;

  constructor() {
    this.panel = null;
  }

  public async launch() 
  {
    const editor: any = vscode.window.activeTextEditor;
    if (editor) 
    {
      const document: any = editor.document;
      
      if (document) 
      {
        const selectedText: any = document.getText();
        const untitledFile = document.uri.with({scheme: 'untitled'});

        vscode.workspace.openTextDocument(untitledFile)
        .then(doc=>
          {
            vscode.window.showTextDocument(doc, 1, false).then(e => {
              e.edit(edit => 
                {
                  const rendererResult = md.render(selectedText);
                  edit.insert(new vscode.Position(0, 0),rendererResult);
                });          
              });
          });

       // this.panel = vscode.window.createWebviewPanel(
       //   "preview", // 
       //   "Vista previa", // 
       //   vscode.ViewColumn.Two, // 显示在编辑器的哪个部位
       //   {
       //     enableScripts: true, // 启用JS，默认禁用
       //   },
       // );
        
      }
    }
  }
}

