import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthCheckService {
  
  constructor(private router: Router) {}

  /**
   * 检查 googleApiKey 是否存在，如果不存在则执行登出
   * @returns boolean - true 表示有效，false 表示无效并已执行登出
   */
  checkGoogleApiKey(): boolean {
    const googleApiKey = localStorage.getItem('googleApiKey') || localStorage['googleApiKey'];
    
    if (!googleApiKey || googleApiKey === '') {
      // 清除所有数据并跳转到登出页面
      this.performLogout();
      return false;
    }
    
    return true;
  }

  /**
   * 获取 googleApiKey，如果不存在则执行登出
   * @returns string | null
   */
  getGoogleApiKeyOrLogout(): string | null {
    const googleApiKey = localStorage.getItem('googleApiKey') || localStorage['googleApiKey'];
    
    if (!googleApiKey || googleApiKey === '') {
      this.performLogout();
      return null;
    }
    
    return googleApiKey;
  }

  private performLogout(): void {
    localStorage['isLogin'] = false;
    localStorage.clear();
    this.router.navigate(['/logout']);
  }
}