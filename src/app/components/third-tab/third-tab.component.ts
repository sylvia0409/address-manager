import {Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {
  MAT_DIALOG_DATA, MatCheckboxChange, MatDialog, MatDialogRef, MatPaginator, MatSnackBar,
  MatTableDataSource
} from "@angular/material";
import { Gateway } from "../../models/gateway.model";
import { SuccessComponent } from "../snackbar/success-bar";
import { FailedComponent } from "../snackbar/failed-bar";

const DEFAULT_GATEWAY  = Object.freeze({
  gateway: '',
  subnet: ''
});

@Component({
  selector: 'app-third-tab',
  templateUrl: './third-tab.component.html',
  styleUrls: ['./third-tab.component.css']
})

export class ThirdTabComponent implements OnInit {
  dataSource: any;
  surveyForm: any;
  gatewayWithId = [];
  selectedGateway = [];
  displayedColumns = ['Gateway', 'Subnet'];
  newGateway = Object.assign({}, DEFAULT_GATEWAY);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(@Inject('dataService') private dataService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private elementRef:ElementRef) { }

  ngOnInit() {
    this.getGateway();
  }

  getGateway() {
    this.dataService.getGateway().subscribe((result: Gateway[]) => {
      this.gatewayWithId = [];
      this.surveyForm = new FormGroup({
        'title': new FormControl(false)
      });
      for(let i = 0; i < result.length; i++){
        let temp = {};
        temp['id'] = 'check'+i;
        temp['gateway'] = result[i].gateway;
        temp['subnet'] = result[i].subnet;
        this.gatewayWithId.push(temp);
        this.surveyForm.addControl(temp['id'], new FormControl(false));
      }
      this.dataSource = new MatTableDataSource<{}>(this.gatewayWithId);
      this.dataSource.paginator = this.paginator;
      let nextButton = this.elementRef.nativeElement.getElementsByClassName('mat-paginator-icon')[1];
      let preButton = this.elementRef.nativeElement.getElementsByClassName('mat-paginator-icon')[0];
      if(nextButton){
        nextButton.addEventListener('click', this._changePage.bind(this));
      }
      if(preButton){
        preButton.addEventListener('click', this._changePage.bind(this));
      }
    })
  }

  addGateway() {
    let dialogRef = this.dialog.open(AddGatewayCardComponent, {
      width: '460px',
      height: '560px',
      data: { gateway: this.newGateway }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(this.newGateway['gateway'] && this.newGateway['subnet']) {
        console.log('result ', result);
        this.dataService.addGateway(this.newGateway)
          .then(() => {
            this._openSuccessBar();
            this.getGateway();
          })
          .catch(error => {
            console.error('Add gateway failed', error);
            this._openFailedBar();
          });
      } else {
        this._openFailedBar();
        console.error('Gateway and subnet are required');
      }
      this.newGateway = Object.assign({}, DEFAULT_GATEWAY);
    });
  }

  deleteGateway() {
    if (this.selectedGateway && this.selectedGateway.length != 0){
      this.dataService.deleteGateway(this.selectedGateway)
        .then(() => {
          this.selectedGateway = [];
          this.getGateway();
        })
        .catch(error => {
          console.error('Delete some gateways failed', error);
        })
    }
  }

  selectedSome(event: MatCheckboxChange, element) {
    this._setTitleState();
    let checked = event.checked;
    if(checked) {
      this.selectedGateway.push(element.gateway);
      console.log('selectedSome ', this.selectedGateway);
    } else {
      this.selectedGateway.splice(this.selectedGateway.indexOf(element.gateway), 1);
      console.log('selectedSome ', this.selectedGateway);
    }
  }

  selectedAll(event: MatCheckboxChange) {
    let start = this.paginator.pageIndex*this.paginator.pageSize;
    let end = (this.paginator.pageIndex+1)*this.paginator.pageSize;
    for(let i = start; i < end; i++){
      let id = 'check' + i;
      if(document.getElementById(id)){
        this.surveyForm.get(id).setValue(event.checked);
      }
    }
    if(event.checked){
      for(let i = start; i < end; i++){
        let id = 'check' + i;
        if(document.getElementById(id)) {
          let value = this.gatewayWithId[i].gateway;
          if(!this.selectedGateway.includes(value)){
            this.selectedGateway.push(value);
          }
        }
      }
    } else {
      let count = 0;
      for(let i = start; i < end; i++){
        let id = 'check' + i;
        if(document.getElementById(id)) {
          count++;
        }
      }
      this.selectedGateway.splice(start, count);
    }
    console.log('all ip', this.selectedGateway);
  }

  private _setTitleState() {
    let start = this.paginator.pageIndex*this.paginator.pageSize;
    let end = (this.paginator.pageIndex+1)*this.paginator.pageSize;
    let validItems = 0;
    let count = 0;
    for(let i = start; i < end; i++){
      let id = 'check' + i;
      if(document.getElementById(id)){
        validItems++;
        if(this.surveyForm.get(id).value){
          count++;
        }
      }
    }
    this.surveyForm.get('title').setValue(count === validItems)
  }


  private _openSuccessBar() {
    this.snackBar.openFromComponent(SuccessComponent, {
      duration: 1000,
      verticalPosition: "top"
    });
  }

  private _openFailedBar() {
    this.snackBar.openFromComponent(FailedComponent, {
      duration: 1000,
      verticalPosition: "top"
    });
  }

  private _changePage() {
    this.surveyForm.get('title').setValue(false);
  }
}

@Component({
  selector: 'add-gateway-card',
  templateUrl: 'add-gateway-card.html',
  styleUrls: ['add-gateway-card.css']
})

export class AddGatewayCardComponent {
  gatewayControl = new FormControl('', [Validators.required]);
  subnetControl = new FormControl('', [Validators.required]);

  @Output() result = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<AddGatewayCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}


