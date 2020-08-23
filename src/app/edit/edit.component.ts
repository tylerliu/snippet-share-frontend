import {Component, OnInit} from '@angular/core';
import {Snippet, SnippetService} from "../snippet.service";
import {ActivatedRoute, Router} from "@angular/router";
import {base64_Decode, base64_Encode} from "../util";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  snippet: Snippet;

  constructor(private snippetService: SnippetService, private clipboard: Clipboard, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.setCurrSnippet(base64_Decode(this.activatedRoute.snapshot.paramMap.get('fileBase64')));
    this.activatedRoute.paramMap.subscribe(() => {
      this.setCurrSnippet(base64_Decode(this.activatedRoute.snapshot.paramMap.get('fileBase64')));
    });
  }

  async setCurrSnippet(fileName: string){
    const retPost = this.snippetService.currentDraft;
    if (this.activatedRoute.snapshot.paramMap.get('fileBase64') === "ANewSnippet") {
      this.snippet = new Snippet();
      return;
    }
    if (retPost === null || retPost.fileName !== fileName) {
      try {
        this.snippet = await this.snippetService.getFile(SnippetService.getCookieUsername(), fileName);
      } catch (err) {
        // cannot get the post/does not exist, then create a new post
        console.log('Edit setCurrPost() error returned: ' + err);
        const newSnippet = new Snippet();
        newSnippet.fileName = '';
        newSnippet.content = '';
        this.snippet = newSnippet;
      }
    } else {
      this.snippet = retPost;
    }
  }

  async onSave() {
    let fileBase64 = this.activatedRoute.snapshot.paramMap.get('fileBase64')
    let oldFileName = base64_Decode(fileBase64);
    if (oldFileName != this.snippet.fileName) {
      try {
        await this.snippetService.newFile(SnippetService.getCookieUsername(), this.snippet);
        this.snippet.modified = new Date(); // update the modified date displayed;
        this.snippetService.sendSaveEvent(this.snippet);

        this.router.navigate([`/edit/${base64_Encode(this.snippet.fileName)}`]);
        if (fileBase64 != "ANewSnippet") {
          try {
            await this.snippetService.deleteFile(SnippetService.getCookieUsername(), oldFileName);
            this.snippetService.sendDeleteEvent(oldFileName);
          } catch (err) {
            alert("Original Snippet failed to delete. Please delete manually. \n" + err);
          }
        }
      } catch (err) {
        alert("Saving Snippet failed: " + err);
      }
    } else {
      try {
        await this.snippetService.updateFile(SnippetService.getCookieUsername(), this.snippet)
        this.snippet.modified = new Date(); // update the modified date displayed;
        this.snippetService.sendSaveEvent(this.snippet);
      } catch (err) {
        alert("Saving Snippet failed: " + err);
      }
    }
  }

  onPreview() {
    this.snippetService.currentDraft = this.snippet;
    this.router.navigate([`/preview/${base64_Encode(this.snippet.fileName)}`]);
  }

  async onDelete() {
    let fileBase64 = this.activatedRoute.snapshot.paramMap.get('fileBase64')
    let oldFileName = base64_Decode(fileBase64);
    this.router.navigate(['/']);
    if (fileBase64 != "ANewSnippet") {
      try {
        await this.snippetService.deleteFile(SnippetService.getCookieUsername(), oldFileName);
        this.snippetService.sendDeleteEvent(oldFileName);
      } catch (err) {
        alert("Post failed to delete. Please try later. \n" + err);
      }
    }
  }

  toggleVisibility() {
    this.snippet.visible = !this.snippet.visible;
  }

  onLink() {
    let fileBase64 = this.activatedRoute.snapshot.paramMap.get('fileBase64');
    if (fileBase64 != base64_Encode(this.snippet.fileName)) {
      alert("Please save first before generating the link");
      return;
    }
    this.clipboard.copy(`${window.location.protocol}//${window.location.host}/file/${SnippetService.getCookieUsername()}/${fileBase64}`);
  }
}
