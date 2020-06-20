import { Observable, Subscriber } from 'rxjs';
import { first, take, takeWhile } from 'rxjs/operators';
import { QueryPaginator } from '../query/QueryPaginator';
import { IQueryCallbackChanges, QuerySubject } from '../QuerySubject';
import { IEntity, IRepositoryDataCreate } from '../Repository';

export class Select<T> {
  private readonly subject: QuerySubject<T>;
  private readonly paginator: QueryPaginator<T>;
  private _subscriptions: any[] = [];

  constructor(subject: QuerySubject<T>) {
    this.subject = subject;
    this.paginator = subject.getPaginator();
  }

  public getPaginator(onChanges?: (event: QueryPaginator<T>) => void): QueryPaginator<T> {
    if (onChanges) {
      this.getResultsAsObservable().subscribe(() => {
        onChanges(this.paginator);
      });
    }
    return this.paginator;
  }

  public getResults(): IEntity<T>[] {
    return this.paginator.getResults();
  }

  public getModels(): T[] {
    return this.paginator.getResults().map((result) => result.getModel());
  }

  public getResultsAsPromise(): Promise<IEntity<T>[]> {
    return new Promise<IEntity<T>[]>((resolve) => {
      this.subject
        .getQueryCallbackChanges()
        .pipe(
          takeWhile((changes: IQueryCallbackChanges) => {
            return changes.results === undefined;
          }),
        )
        .toPromise()
        .then(() => {
          resolve(this.getResults());
        });
      this.subject.execStatement(this.subject.getSql());
    });
  }

  public toJson(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.subject
        .getQueryCallbackChanges()
        .pipe(
          takeWhile((changes: IQueryCallbackChanges) => {
            return changes.results === undefined;
          }),
        )
        .toPromise()
        .then(() => {
          const results: any[] = [];
          this.getResults().forEach((r: IEntity<T>) => {
            const c = (r as any)._toPlain();
            Object.keys(c).forEach((key) => {
              if (key.substr(0, 2) === '__') {
                delete c[key];
              }
            });
            results.push(c);
          });
          resolve(JSON.stringify(results));
        });
      this.subject.execStatement(this.subject.getSql());
    });
  }

  public getResultsAsObservable(): Observable<IEntity<T>[]> {
    return new Observable<IEntity<T>[]>((observer: Subscriber<IEntity<T>[]>) => {
      this._subscriptions.push(
        this.subject.getQueryCallbackChanges().subscribe((changes: IQueryCallbackChanges) => {
          if (changes.results !== undefined) {
            this.subject.getRepository()._zone.run(() => {
              observer.next(this.getResults());
            });
          }
        }),
      );
    });
  }

  public getReadOnlyResultsAsObservable(): Observable<T[]> {
    return new Observable<T[]>((observer: Subscriber<T[]>) => {
      this._subscriptions.push(
        this.subject.getQueryCallbackChanges().subscribe((changes: IQueryCallbackChanges) => {
          if (changes.results !== undefined) {
            this.subject.getRepository()._zone.run(() => {
              observer.next(
                this.getResults().map((item: IEntity<T>) => {
                  return item.getModel();
                }),
              );
            });
          }
        }),
      );
    });
  }

  public create(data?: IRepositoryDataCreate<T>, id?: string | number): Promise<IEntity<T>> {
    return new Promise<IEntity<T>>((resolve, reject) => {
      this.subject
        .getRepository()
        .create(data, id, this.subject.getSqlSelectParsed(this.subject.getSql()))
        .then((c: IEntity<T>) => {
          this.subject
            .getQueryCallbackChanges()
            .pipe(take(1))
            .toPromise()
            .then(() => {
              resolve(c);
            });
          this.subject.execStatement(this.subject.getSql());
        });
    });
  }

  public unsubscribe() {
    this._subscriptions.forEach((sub: any) => {
      sub.unsubscribe();
    });
  }
}
