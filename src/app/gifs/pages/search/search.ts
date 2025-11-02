import { Component, inject, signal } from '@angular/core';
import { GifService } from '../../services/gif.service';
import { GifList } from "../../components/gif-list/gif-list";
import { Gif } from '../../interfaces/gif';

@Component({
  selector: 'app-search',
  imports: [GifList],
  templateUrl: './search.html',
})
export default class Search {

  gifService = inject(GifService)

  gifs = signal<Gif[]>([])

  loadSearchedGifs (query: string) {
   this.gifService.searchGifs(query)
    .subscribe(gifs => this.gifs.set(gifs))
  }
}
