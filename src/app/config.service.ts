import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  appConfig = {
		//local
		// "api_url": "http://pwgroup.local/en/api",
		// "api_url2": "https://pwgroup.local/en",
		//dev
		// "api_url": "https://dev.pwgroup.my/en/api",
		// "api_url2": "https://dev.pwgroup.my/en",
		//dev Bullion
		// "api_url": "https://devb.pwgroup.my/en/api",
		// "api_url2": "https://devb.pwgroup.my/en",
		//production
		"api_url": "https://pwgroup.my/en/api",
		"api_url2": "https://pwgroup.my/en",
		version: "0.0.177",
	};

  constructor() { }
}
