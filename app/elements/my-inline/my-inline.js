/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MyInline = (function (_super) {
    __extends(MyInline, _super);
    function MyInline() {
        _super.apply(this, arguments);
    }
    __decorate([
        property({ value: "hi" }), 
        __metadata('design:type', String)
    ], MyInline.prototype, "prop");
    MyInline = __decorate([
        component("my-inline"),
        template("\n   <div>\n      This element has been created completely from code\n      <br>The prop is: <span>{{prop}}</span>\n   </div>\n"),
        style("\n   :host {\n      display: block;\n   }\n\n   div {\n      color: red;\n   }\n"), 
        __metadata('design:paramtypes', [])
    ], MyInline);
    return MyInline;
})(polymer.Base);
MyInline.register();
//# sourceMappingURL=my-inline.js.map