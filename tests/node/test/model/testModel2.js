"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstractModel_1 = require("../../../../src/abstractModel");
class TestModel2 extends abstractModel_1.AbstractModel {
    constructor() {
        super(...arguments);
        this.name = '';
        this.lastName = '';
    }
}
exports.TestModel2 = TestModel2;
