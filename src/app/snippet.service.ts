import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {base64_Decode, base64_Encode} from "./util";

export class Snippet {
  fileName: string = "";
  modified: Date = new Date();
  visible: boolean = false;
  content: string = "";
}

@Injectable({
  providedIn: 'root'
})

export class SnippetService {
  private _currentDraft: Snippet | null = null;
  private deleteMessageSource = new Subject<string>();
  deleteMessage$ = this.deleteMessageSource.asObservable();
  private saveMessageSource = new Subject<Snippet>();
  saveMessage$ = this.saveMessageSource.asObservable();

  static parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(base64_Decode(base64));
  }

  static getCookieUsername() {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );

    return this.parseJWT(token).user;
  }

  constructor() {
  }

  async fetchFiles(username: string): Promise<Snippet[]> {
    let res = await fetch(`/api/${username}`, {
      method: 'GET',
      credentials: 'same-origin', // test whether cookie is sent
    })
    if (res.status !== 200) {
      throw res.status;
    }
    let result = await res.json();
    return result.map((e) => {
      e.modified = new Date(e.modified);
      return e as Snippet;
    });
  }

  async getFile(username: string, fileName: string): Promise<Snippet> {
    let res = await fetch(`/api/${username}/${base64_Encode(fileName)}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
    if (res.status !== 200) {
      throw res.status;
    }
    let result = await res.json();
    return {
      fileName: result.fileName,
      modified: new Date(result.modified),
      visible: result.visible,
      content: result.content
    }
  }

  async newFile(username: string, snippet: Snippet): Promise<void> {
    let res = await fetch(`/api/${username}/${base64_Encode(snippet.fileName)}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snippet)
    })
    if (res.status !== 201) {
      throw (res.status);
    }
  }

  async updateFile(username: string, snippet: Snippet): Promise<void> {
    let res = await fetch(`/api/${username}/${base64_Encode(snippet.fileName)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snippet)
    })
    if (res.status !== 200) {
      throw res.status;
    }
  }

  async deleteFile(username: string, fileName: string): Promise<void> {
    let res = await fetch(`/api/${username}/${base64_Encode(fileName)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    if (res.status !== 204) {
      throw res.status;
    }
  }

  get currentDraft(): Snippet | null {
    return this._currentDraft;
  }

  set currentDraft(value: Snippet | null) {
    this._currentDraft = value;
  }

  sendDeleteEvent(fileName: string): void{
    this.deleteMessageSource.next(fileName);
  }

  sendSaveEvent(snippet: Snippet): void {
    this.saveMessageSource.next(snippet);
  }
}
