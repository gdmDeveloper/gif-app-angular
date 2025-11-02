import { Component, input } from '@angular/core';

interface gifItem {
  class: string;
  src: string;
}

@Component({
  selector: 'gif-list-item',
  imports: [],
  templateUrl: './gif-list-item.html',
})
export class GifListItem {

  url = input<string>();


}
