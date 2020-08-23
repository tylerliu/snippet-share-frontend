import { Component, OnInit } from '@angular/core';
import {Snippet, SnippetService} from "../snippet.service";
import {ActivatedRoute, Router} from "@angular/router";
import {base64_Encode} from "../util";
import * as moment from "moment";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  snippets: Snippet[] = [];

  constructor(private snippetService: SnippetService, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.initSnippetList();
    this.snippetService.deleteMessage$.subscribe((fileName) => this.deleteFile(fileName));
    this.snippetService.saveMessage$.subscribe((file) => this.saveFile(file));
  }

  initSnippetList() {
    this.snippetService.fetchFiles(SnippetService.getCookieUsername())
      .then( snippets => {
        this.snippets = snippets;
      }).catch(err => {
      if (err === 401) {
        alert('Login First Please');
      } else {
        alert('Initialization error: ' + err);
      }
    });
  }

  onSelect(snippet: Snippet) {
    this.snippetService.currentDraft = snippet;
    this.router.navigate([`/edit/${base64_Encode(snippet.fileName)}`]);
  }

  onNew() {
    // generate new snippet
    this.snippetService.currentDraft = null;
    this.router.navigate(['/edit/ANewSnippet']);
  }

  deleteFile(fileName: string) {
    this.snippets = this.snippets.filter(snippet => snippet.fileName !== fileName);
  }

  saveFile(newSnippet: Snippet) {
    this.snippets = this.snippets.filter(snippet => snippet.fileName !== newSnippet.fileName);
    this.snippets.push(newSnippet);
    this.snippets.sort((a, b) => {
      return b.modified.getTime() - a.modified.getTime();
    }); // sort by modification time
  }

  getFromNow(date: Date) {
    return moment(date).fromNow();
  }

}
