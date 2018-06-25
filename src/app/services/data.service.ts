import { Injectable } from '@angular/core';
import { IPAddress } from "../models/ip-address.model";
import { Gateway } from "../models/gateway.model";
import {BehaviorSubject, Observable} from "rxjs/index";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class DataService {

  private _ipSource = new BehaviorSubject<IPAddress[]>([]);
  private _unassignedSource = new BehaviorSubject<string[]>([]);
  private _gatewaySource = new BehaviorSubject<Gateway[]>([]);

  constructor(private http: HttpClient) { }

  getIpAddress(): Observable<IPAddress[]> {
    this.http.get('http://localhost:3000/api/v1/ip-info')
      .toPromise()
      .then((res: IPAddress[]) => {
        this._ipSource.next(res)
      })
      .catch(this.handleError);
    return this._ipSource.asObservable();
  }


  getUnassignedIp(tenant: string): Observable<string[]> {
    this.http.get(`http://localhost:3000/api/v1/${tenant}/unassigned-ip`)
      .toPromise()
      .then((res: string[]) => {
        this._unassignedSource.next(res);
      })
      .catch(this.handleError);
    return this._unassignedSource.asObservable();
  }

  getGateway():Observable<Gateway[]> {
    this.http.get('http://localhost:3000/api/v1/gateway')
      .toPromise()
      .then((res: Gateway[]) => {
        this._gatewaySource.next(res);
      })
      .catch(this.handleError);
    return this._gatewaySource.asObservable();
  }

  addIpAddress(tenant: string, newIp: string[]): Promise<any>{
    const options = {
      headers: new HttpHeaders({'content-type': 'application/json'})
    }
    return this.http.post(`http://localhost:3000/api/v1/${tenant}/ip`,newIp,options)
      .toPromise()
      .then((res) =>{
        return res;
      })
      .catch(this.handleError);
  }

  addGateway(newGateway):Promise<any>{
    const options = {
      headers: new HttpHeaders({'content-type': 'application/json'})
    }
    return this.http.post('http://localhost:3000/api/v1/gateway', newGateway, options)
      .toPromise()
      .then((res) =>{
        return res;
      })
      .catch(this.handleError);
  }

  deleteIpAddress(tenant: string, deleteIp: string[]): Promise<any>{
    return this.http.delete(`http://localhost:3000/api/v1/${tenant}/ip/${deleteIp}`)
      .toPromise()
      .then((res) => {
        return res;
      })
      .catch(this.handleError);
  }

  deleteGateway(deleteGateway: string[]):Promise<any>{
    return this.http.delete(`http://localhost:3000/api/v1/gateway/${deleteGateway}`)
      .toPromise()
      .then((res) =>{
        return res;
      })
      .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    console.error('An error happened in service', error);
    return Promise.reject(error.body || error);
  }

}
