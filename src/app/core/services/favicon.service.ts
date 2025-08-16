
import {Inject, Injectable, Renderer2, RendererFactory2, DOCUMENT} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FaviconService {
  private renderer: Renderer2;

  constructor(
    private rf: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rf.createRenderer(null, null);
  }

  setFavIcon(favIcon: string) {
    const link: HTMLLinkElement =
      this.document.querySelector("link[rel*='icon']") ||
      this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'icon');
    this.renderer.setAttribute(link, 'href', favIcon);
    this.renderer.appendChild(this.document.head, link);
  }
}
