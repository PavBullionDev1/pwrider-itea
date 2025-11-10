import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeDirective } from './swipe.directive';



@NgModule({
  declarations: [
    SwipeDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SwipeDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SwipeModule { }
