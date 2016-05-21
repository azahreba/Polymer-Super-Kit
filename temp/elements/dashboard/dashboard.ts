/// <reference path="../polymer-ts/polymer-ts.ts" />

@component("dashboard")
class Dashboard extends polymer.Base {
    @property({route: Object})

    attached() {
    }
}

Dashboard.register();
