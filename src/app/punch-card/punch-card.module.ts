import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PunchCardPageRoutingModule } from './punch-card-routing.module';
import { PunchCardPage } from './punch-card.page';
import { HttpClientModule } from '@angular/common/http';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		PunchCardPageRoutingModule,
		ReactiveFormsModule,
		HttpClientModule,
		SwipeModule
	,
    SharedModule],
	declarations: [
		PunchCardPage],
})
export class PunchCardPageModule { }
