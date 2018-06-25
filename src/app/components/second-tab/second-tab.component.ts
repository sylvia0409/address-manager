import {Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef,
        MatDialog, MatSnackBar, MatCheckboxChange} from "@angular/material";
import {IPAddress} from "../../models/ip-address.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { SuccessComponent } from "../snackbar/success-bar";
import { FailedComponent } from "../snackbar/failed-bar";

const DEFAULT_IP  = Object.freeze({
  ipStart: '',
  ipEnd: '',
  tenant: ''
});

@Component({
  selector: 'app-second-tab',
  templateUrl: './second-tab.component.html',
  styleUrls: ['./second-tab.component.css']
})


export class SecondTabComponent implements OnInit {
  tenants: string[];
  currentTenant: string;
  dataSource: any;
  surveyForm: any;
  unassignedIPWithId = {};
  selectedIPs = [];
  displayedColumns = ['unassigned-ip'];
  newIP = Object.assign({}, DEFAULT_IP);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(@Inject('dataService') private dataService,
              private dialog: MatDialog,
              public snackBar: MatSnackBar,
              private elementRef: ElementRef) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.dataService.getIpAddress().subscribe((ipAddress:IPAddress[]) => {
        let tempTenants = [];
        for(let i in ipAddress){
          tempTenants.push(ipAddress[i]['tenant']);
        }
        this.tenants = Array.from(new Set(tempTenants));
        if(this.tenants && this.tenants.length > 0){
          this.currentTenant = this.tenants[0];
          this.getUnassignedIp(this.currentTenant);
        }
      },
      error => console.error('Init form failed --> get ip address failed', error));
  }

  getUnassignedIp(tenant) {
    this.selectedIPs =[];
    this.dataService.getUnassignedIp(tenant).subscribe((result: string[]) => {
      this.unassignedIPWithId[tenant] = [];
      this.surveyForm = new FormGroup({
          'title': new FormControl(false)
        });
      for(let i = 0; i < result.length; i++){
        let temp = {};
        temp['id'] = 'check'+i;
        temp['address'] = result[i];
        this.unassignedIPWithId[tenant].push(temp);
        this.surveyForm.addControl(temp['id'], new FormControl(false));
      }
      this.dataSource = new MatTableDataSource<{}>(this.unassignedIPWithId[tenant]);
      this.dataSource.paginator = this.paginator;
      let nextButton = this.elementRef.nativeElement.getElementsByClassName('mat-paginator-icon')[1];
      let preButton = this.elementRef.nativeElement.getElementsByClassName('mat-paginator-icon')[0];
      if(nextButton){
        nextButton.addEventListener('click', this._changePage.bind(this));
        }
      if(preButton){
        preButton.addEventListener('click', this._changePage.bind(this));
        }
      },
      error => console.error('get ip address failed', error));
  }

  addIpAddress() {
    let dialogRef = this.dialog.open(AddIpCardComponent, {
      width: '530px',
      height: '560px',
      data: { ip: this.newIP }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(this.newIP['ipStart'] && this.newIP['ipEnd'] && this.newIP['tenant']) {
        console.log('result ', result);
        let addContent = [];
        addContent.push(result['ipStart'], result['ipEnd']);
        this.dataService.addIpAddress(result['tenant'], addContent)
          .then(() => {
            this._openSuccessBar();
            this.getUnassignedIp(this.currentTenant);
          })
          .catch(error => {
            console.error('Add ip failed', error);
            this._openFailedBar();
          });
      } else {
        this._openFailedBar();
        console.error('IP and tenant are required');
      }
      this.newIP = Object.assign({}, DEFAULT_IP);
    });
  }

  deleteIpAddress() {
    if (this.selectedIPs && this.selectedIPs.length != 0){
      this.dataService.deleteIpAddress(this.currentTenant, this.selectedIPs)
        .then(() => {
          this.selectedIPs = [];
          this.getUnassignedIp(this.currentTenant);
        })
        .catch(error => {
          console.error('Delete some IPs failed', error);
        })
    }
  }

  selectedSome(event: MatCheckboxChange, element) {
    this._setTitleState();
    let checked = event.checked;
    if(checked) {
      this.selectedIPs.push(element.address);
      console.log('selectedSome ', this.selectedIPs);
    } else {
      this.selectedIPs.splice(this.selectedIPs.indexOf(element.address), 1);
      console.log('selectedSome ', this.selectedIPs);
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
          let value = this.unassignedIPWithId[this.currentTenant][i].address;
          if(!this.selectedIPs.includes(value)){
            this.selectedIPs.push(value);
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
      this.selectedIPs.splice(start, count);
    }
    console.log('all ip', this.selectedIPs);
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
  selector: 'add-ip-card',
  templateUrl: 'add-ip-card.html',
  styleUrls: ['add-ip-card.css']
})

export class AddIpCardComponent implements OnInit{
    tenants: string[];

    tenantControl = new FormControl('', [Validators.required]);
    ipStartControl = new FormControl('', [Validators.required]);
    ipEndControl = new FormControl('', [Validators.required]);

    @Output() result = new EventEmitter<string>();

    constructor(
      public dialogRef: MatDialogRef<AddIpCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      @Inject('dataService') private dataService) { }

      ngOnInit() {
        this.getTenants();
      }
      onNoClick() {
        this.dialogRef.close();
      }

    getTenants() {
      this.dataService.getIpAddress().subscribe((ipAddress:IPAddress[]) => {
          let tempTenants = [];
          for(let i in ipAddress){
            tempTenants.push(ipAddress[i]['tenant']);
          }
          this.tenants = Array.from(new Set(tempTenants));
          this.data.ip['tenant'] = this.tenants[0];
        });
    }
}


