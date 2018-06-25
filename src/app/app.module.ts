import { BrowserModule } from '@angular/platform-browser';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, ElementRef} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AddressComponent } from './components/address/address.component';
import { BackgroundCardComponent } from './components/background-card/background-card.component';
import { FirstTabComponent } from './components/first-tab/first-tab.component';
import { SecondTabComponent, AddIpCardComponent} from './components/second-tab/second-tab.component';
import { ThirdTabComponent, AddGatewayCardComponent} from './components/third-tab/third-tab.component';
import { SuccessComponent } from "./components/snackbar/success-bar";
import { FailedComponent } from "./components/snackbar/failed-bar";

import { DataService } from "./services/data.service";

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkTableModule} from '@angular/cdk/table';
import {
  MatGridListModule,
  MatCardModule,
  MatToolbarModule,
  MatListModule,
  MatButtonModule,
  MatIconModule,
  MatPaginatorModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatInputModule,
  MatCheckboxModule,
  MatDialogModule,
  MatSnackBarModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    AddressComponent,
    BackgroundCardComponent,
    FirstTabComponent,
    SecondTabComponent,
    ThirdTabComponent,
    AddIpCardComponent,
    AddGatewayCardComponent,
    SuccessComponent,
    FailedComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    CdkTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [{
    provide: 'dataService',
    useClass: DataService
  },
    SecondTabComponent],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [SecondTabComponent,
                    AddIpCardComponent,
                    SuccessComponent,
                    FailedComponent,
                    AddGatewayCardComponent]
})
export class AppModule { }
