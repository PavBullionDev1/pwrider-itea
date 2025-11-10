import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // 检查 googleApiKey 是否存在
    const googleApiKey = localStorage.getItem('googleApiKey') || localStorage['googleApiKey'];
    
    if (!googleApiKey || googleApiKey === '') {
      // 如果 googleApiKey 为空，清除所有数据并跳转到登录页
      localStorage.clear();
      this.router.navigate(['/logout']);
      return false;
    }
    
    return true;
  }
}