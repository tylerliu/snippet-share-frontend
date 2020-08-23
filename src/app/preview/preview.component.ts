import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SnippetService} from "../snippet.service";
import {HtmlRenderer, Parser} from "commonmark";
import {base64_Decode} from "../util";
import {highlight, highlightAuto} from "highlight.js";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})

export class PreviewComponent implements OnInit {
  fileName: string;
  renderedBody: string;
  static parser = new Parser();
  static renderer = new HtmlRenderer();

  static renderContent(fileName: string, content: string){
      if (fileName.endsWith(".html") || fileName.endsWith(".htm")) return content;
      if (fileName.endsWith(".md")) return PreviewComponent.renderer.render(PreviewComponent.parser.parse(content));
      if (fileName.endsWith(".txt") || fileName.endsWith(".text")) {
        return `<pre><code>${highlight('plaintext', content).value}</code></pre>`
      }
      console.log(highlightAuto(content).value);
      return `<pre><code>${highlightAuto(content).value}</code></pre>`;
  }

  constructor(private snippetService: SnippetService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadSnippet(base64_Decode(this.activatedRoute.snapshot.paramMap.get('fileBase64')));
    this.activatedRoute.paramMap.subscribe(() => {
      this.loadSnippet(base64_Decode(this.activatedRoute.snapshot.paramMap.get('fileBase64')));
    });
  }

  async loadSnippet(fileName: string) {
    this.fileName = fileName;
    const draftPost = this.snippetService.currentDraft;
    if (draftPost === null || draftPost.fileName !== fileName) {
      try {
        let res = await this.snippetService.getFile(SnippetService.getCookieUsername(), fileName)
        this.snippetService.currentDraft = res;
        this.renderedBody = PreviewComponent.renderContent(fileName, res.content);
      }catch(err) {
            // cannot get the snippet/does not exist
            alert('preview snippet requested does not exist! ' + err);
          }
    } else {
      this.renderedBody = PreviewComponent.renderContent(fileName, draftPost.content);
    }
  }

  onEdit() {
    this.router.navigate([`/edit/${this.activatedRoute.snapshot.paramMap.get('fileBase64')}`]);
  }

}
