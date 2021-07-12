import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FbCreateResponse, Post} from "./interfaces";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class PostService {
  constructor(private http: HttpClient) {
  }

  create(post: Post): Observable<Post> {
    return this.http.post<FbCreateResponse>(`${environment.fbDbUrl}/posts.json`, post)
      .pipe(
        map((response) => {
          return {
            ...post,
            id: response.name,
            date: post.date
          }
        })
      )
  }
}
