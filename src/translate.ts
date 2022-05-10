import * as marked from "marked";
import * as vscode from "vscode";

import * as request from 'request';
import * as urlencode from 'urlencode';
import * as util from 'util';

// const request = require('request');
// const util = require('util');
// const urlencode = require('urlencode');

export default class TranslateMd {
  private disposables: vscode.Disposable[] = [];
  private panel: vscode.WebviewPanel | null;
  
  private tkk: any = '429175.1243284773'

  constructor() {
    this.panel = null;
  }

  Ho (a: any) {
    return function() {
        return a
    }
  }

  Io(a: any, b: any) {
    for (let c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
  }

  tk(a: any, tkk: any) {
    let b: any = tkk || ""
    let d: any = this.Ho(String.fromCharCode(116));
    let c: any = this.Ho(String.fromCharCode(107));
    d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    let e: any, f: any,g: any;
    for (e = [], f = 0, g = 0; g < a.length; g++) {
      let k = a.charCodeAt(g);
        128 > k ? e[f++] = k : (2048 > k ? e[f++] = k >> 6 | 192 : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023),
        e[f++] = k >> 18 | 240,
        e[f++] = k >> 12 & 63 | 128) : e[f++] = k >> 12 | 224,
        e[f++] = k >> 6 & 63 | 128),
        e[f++] = k & 63 | 128)
    }
    a = b;
    for (let f = 0; f < e.length; f++)
        a += e[f],
        a = this.Io(a, "+-a^+6");
    a = this.Io(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b))
  };

   async doExe(word: any) {
     try {
      const getPromise: any = util.promisify(request.get);  // 

      const encode = urlencode.encode(word)

      const tkkk = this.tk(word, this.tkk)

      let url: any = `https://translate.google.cn/translate_a/single?client=webapp&sl=en&tl=es-MX&hl=es-MX&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&pc=1&otf=1&ssel=0&tsel=0&kc=1${tkkk}&q=${encode}`; 
     
      let translateRst: any = await getPromise(url);
      // 可以加入 try catch 捕获异常  也可以加 .catch()
      //console.log("translateRst");
      // console.log(translateRst);
  
      let tranWord: any = JSON.parse(translateRst.body);
      let result: any = tranWord[0][0][0]

      return result;
      // return 'error:: '
     } catch (error) {
        return 'error:: '+error
     }
    
  }

  async traslateTokens(tokens : [any]){
    
    for (const key in tokens) {
      if(tokens[key].type !== 'code'){
        
        if(key==='links') break;

          if(tokens[key].type === 'paragraph'){
            tokens[key].tokens = await this.traslateTokens(tokens[key].tokens);
          }else{

            if(tokens[key].tokens){
              tokens[key].tokens = await this.traslateTokens(tokens[key].tokens);
            }

            console.log("Antes:", key, tokens[key].type, tokens[key].text);
            const query: any = tokens[key].text;

            if (undefined !== query ) {
              let result: any = await this.doExe(query)
              console.log(result);
              tokens[key].text = result;
              console.log("Despues:", key, tokens[key].type, tokens[key].text);
            }

          }
      }
    }

    return tokens;
  }

  public async launch() {

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'Traduciendo'
      }, async (progress) => {
          
          progress.report({  increment: 0 });
      
          var result =  await this.traslate();

          var edit = await this.openWindow();
          if(edit){
            edit.edit(editBuilder=> editBuilder.insert(new vscode.Position(0,0), result));
          }
          progress.report({ increment: 100 });
      });
  }

  public async openWindow(): Promise<vscode.TextEditor | undefined>{
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

    if(editor){
      const fileName = 'untitled-traslated.md';
      var uri = vscode.Uri.file(fileName).with({scheme: 'untitled', path: fileName});

      var doc = await vscode.workspace.openTextDocument(uri)
      var edit = await vscode.window.showTextDocument(doc, editor.viewColumn! + 1)
      
      return edit;
    }
  }

  public async traslate() {
    const editor: any = vscode.window.activeTextEditor;
    
    if (editor) {
      const document: any = editor.document;
      if (document) {
        const selectedText: any = document.getText();

        var tokens: any = marked.lexer(selectedText); // Parse and return array of token marked.js
        tokens = await this.traslateTokens(tokens);

        const rendererResult: any = marked.parser(tokens);

        return rendererResult;

        //Render html to MarkDown
        var TurndownService = require('turndown')
        var turndownService = new TurndownService({
          headingStyle: 'atx',
          bulletListMarker: '*',
          codeBlockStyle: 'fenced'
         });

         return turndownService.turndown(rendererResult);
      }
    }
  }
}
