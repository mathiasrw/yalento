import {take} from "rxjs/operators";
import {QueryPaginator} from "../query/QueryPaginator";
import {QuerySubject} from "../QuerySubject";
import {IRepositoryDataCreate} from "../Repository";

export class Select<T> {

    private readonly subject: QuerySubject<T>;
    private readonly paginator: QueryPaginator<T>;

    constructor(subject: QuerySubject<T>) {
        this.subject = subject;
        this.paginator = subject.getPaginator();
    }

    public getPaginator(): QueryPaginator<T> {
        return this.paginator;
    }

    public getResults(): T[] {
        return this.paginator.getResults();
    }

    public getResultsAsPromise(): Promise<T[]> {
        return new Promise<T[]>((resolve => {
            this.subject.getQueryCallbackChanges().pipe(take(1)).toPromise().then(() => {
                resolve(this.getResults());
            });
            this.subject.execStatement(this.subject.getSql());
        }));
    }

    public create(data?: IRepositoryDataCreate, id?: string | number): Promise<T> {

        return new Promise<T>((resolve, reject) => {

            this.subject.getRepository().create(data, id, this.subject.getSqlSelectParsed(this.subject.getSql())).then((c: T) => {
                this.subject.getQueryCallbackChanges().pipe(take(1)).toPromise().then(() => {
                    resolve(c);
                });
                this.subject.execStatement(this.subject.getSql());
            }).catch((e: any) => {
                reject(e);
            });


        });

    }

}