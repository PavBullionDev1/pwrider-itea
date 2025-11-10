import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {

  constructor(private router: Router) {

  }

  ngOnInit() {
    // console.log("test222");
    localStorage['isLogin'] = false;

    // 清除敏感的API keys
    localStorage.removeItem('googleApiKey');
    localStorage.removeItem('firebaseApiKey');

    // 清除所有用户数据
    localStorage.clear();

    this.router.navigate(['login']);
  }

}
