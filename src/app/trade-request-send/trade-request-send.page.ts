import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-trade-request-send',
  templateUrl: './trade-request-send.page.html',
  styleUrls: ['./trade-request-send.page.scss'],
})
export class TradeRequestSendPage implements OnInit {

  constructor(
    private router:Router,
    public menuCtrl:MenuController
    ) {     
      this.menuCtrl.swipeGesture(false);
  }

  ngOnInit() {
    this.backHomeAfterThreeSecond();
  }

  backToHome(){
    this.router.navigate(['/home']);
  }

  backHomeAfterThreeSecond(){
    var root = this;
    setTimeout(function(){ 
      root.backToHome();
    }, 3000);
  }

}
