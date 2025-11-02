import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { GiphyResponse } from '../interfaces/gifs';
import { GifMapper } from '../mapper/gifs.mapper';
import { Gif } from '../interfaces/gif';
import { map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GifService {

  constructor() {
    this.loadTrendingGifs();
  }

  private http = inject(HttpClient);


  trendingGifs = signal<Gif[]>([]);
  trendingGifGroup = computed<Gif[][]>( () => {
    const groups = [];
    for (let i = 0; i < this.trendingGifs().length; i+=3) {
      groups.push(this.trendingGifs().slice(i, i + 3))
    }

    return groups;
  })
  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>(this.loadHistoryGifs()); // Llave valor
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()))


  saveHistoryToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem("gifs", historyString);
  })



  loadHistoryGifs() {
    const gifsFromLocalStorage = localStorage.getItem("gifs") ?? '{}';
    return JSON.parse(gifsFromLocalStorage);

  }

  loadTrendingGifs() {
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/trending`, {
      params: {
        api_key: `${environment.giphyApiKey}`,
        limit: 20
      }
    }).subscribe((resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data)
      this.trendingGifs.set(gifs)
      this.trendingGifsLoading.set(false)
    })
  }


  searchGifs(query: string): Observable<Gif[]> {
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/search`, {
      params: {
        api_key: `${environment.giphyApiKey}`,
        q: query,
        limit: 20
      }
    }).pipe(
      map(({ data }) => data),
      map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
      tap((items) => {
        this.searchHistory.update(history => ({
          ...history,
          [query.toLocaleLowerCase()]: items,
        }))
      })
    )
  }


  getGifsByQuery(query: string): Gif[] {
    return this.searchHistory()[query] ?? []
  }

}
