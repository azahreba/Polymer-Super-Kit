/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts"/>

@component("fluid-button")
class FluidButton extends polymer.Base implements polymer.Element
{
   @property({ type: String, value: "" })
   public text: string;


   private longpress = false;
   private presstimer = null;
   private longtarget = null;

   get el():HTMLElement {

     return this.$$("#fldbtn");

   }

   @listen("up")
   private cancel(ev:CustomEvent) {
     console.log("up", ev);

     if(this.presstimer !== null) {
         clearTimeout(this.presstimer);
     }

     this.el.classList.remove("longpress");
   }

   @listen("tap")
   private click(ev:CustomEvent) {
     console.log("down", ev);

     if(this.presstimer !== null) {
         clearTimeout(this.presstimer);
     }


     this.el.classList.remove("longpress");

     if(this.longpress) {
         return false;
     }

     this.fire("press", ev.detail);

   }

   @listen("down")
   private start(ev:CustomEvent) {

     console.log("tap", ev);

     var _ev = ev.detail.sourceEvent;

     if(_ev.type === "click" && _ev.button !== 0) {
         return;
     }

     this.longpress = false;

     this.el.classList.add("longpress");

     this.presstimer = setTimeout(() => {
         this.longpress = true;

         this.fire("longpress", ev.detail);

     }, 1000);

     return false;

   }

   ready() {

       console.log( this["is"], "ready!");


       this.async( ()=>{

         console.log( "FluidButton async");
         this.text = "HELLO!";

       }, 1000);

   }


}

FluidButton.register();
