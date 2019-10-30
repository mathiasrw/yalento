import {expect} from 'chai';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import {Guid} from "guid-typescript";
import {describe, it} from 'mocha';
import {Repository} from '../Repository';

export class Contact {

    public name: string = '';
    public lastName: string = '';
    public street: string = '';
    public age: number = 1;
}


describe('AngularFirestoreConnectorTest', async () => {

    it('angular firestore should be connected to repository', async () => {

        const repo = new Repository<Contact>(Contact);
        const fb = firebase.initializeApp({
            apiKey: "AIzaSyAgHaHlFGw6bVr5WDscLG8Kn8jF_rYJgGY",
            authDomain: "yalento-test.firebaseapp.com",
            databaseURL: "https://yalento-test.firebaseio.com",
            projectId: "yalento-test",
            storageBucket: "yalento-test.appspot.com",
            messagingSenderId: "252117874295",
            appId: "1:252117874295:web:55f6e8a5e8a50096627872",
            measurementId: "G-DKEPQWT1H3",
        }, 'test' + Guid.create());

        repo.connectFirestore(fb);

        expect(await repo.create()).to.be.deep.equal({name: '', lastName: '', street: '', age: 1});

        repo.destroy();


    });


});
