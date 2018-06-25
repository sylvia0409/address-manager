import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {IPAddress} from "../../models/ip-address.model";
import {MatPaginator, MatTableDataSource} from "@angular/material";

@Component({
  selector: 'app-first-tab',
  templateUrl: './first-tab.component.html',
  styleUrls: ['./first-tab.component.css']
})
export class FirstTabComponent implements OnInit {

  ipAddress: IPAddress[];
  displayedColumns = ['IP', 'Pod', 'application', 'service', 'tenant'];
  dataSource: any;
  inputData = '';
  searchResult = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(@Inject('dataService') private dataService) { }

  ngOnInit() {
    this.getIpAddress();
  }

  getIpAddress(): void{
    this.dataService.getIpAddress().subscribe((ipAddress:IPAddress[]) => {
        this.ipAddress = ipAddress;
        this.dataSource = new MatTableDataSource<IPAddress>(this.ipAddress);
        this.dataSource.paginator = this.paginator;
      },
      error => console.error('get ip address failed', error));
  }

  search(event) {
    if(event.keyCode == '13'){
      this.inputData = this.inputData.replace(/\s+/g,"");
      if(this.inputData.length == 0){
        this.dataSource = new MatTableDataSource<IPAddress>(this.ipAddress);
        this.dataSource.paginator = this.paginator;
        return;
      }
      for(let i = 0; i < this.ipAddress.length; i++){
        if(this.ipAddress[i].ip.indexOf(this.inputData) > -1 ||
           this.ipAddress[i].pod.indexOf(this.inputData) > -1 ||
           this.ipAddress[i].application.indexOf(this.inputData) > -1 ||
           this.ipAddress[i].service.indexOf(this.inputData) > -1 ||
           this.ipAddress[i].tenant.indexOf(this.inputData) > -1){
             this.searchResult.push(this.ipAddress[i]);
        }
      }
      this.inputData = '';
      this.dataSource = new MatTableDataSource<IPAddress>(this.searchResult);
      this.dataSource.paginator = this.paginator;
      this.searchResult = [];
    }
  }

  refresh() {
    this.getIpAddress();
  }

}
