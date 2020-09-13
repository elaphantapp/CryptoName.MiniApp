$('body').loading({
  onStart: function(loading) {
    loading.overlay.slideDown(400);
  },
  onStop: function(loading) {
    loading.overlay.slideUp(400);
  }
});

window.initWallet().then(function(result) {
	if (!window.crypton)
		alert("Init Web3 Provider failed, please restart browser and try again.");

	const url = new URL(window.location.href.replace("#", ""));
	var entryURL = url.href;
	window.returnURL = window.location.href.split('?')[0].replace("#", "");

	let params = new URLSearchParams(url.search.substring(1));
	//var identityData = params.get("Data");
	var newTxid = params.get("TXID");
	var tmpAddr = params.get("address");
	var tabPage = params.get("tab");
	var newName = params.get("new");

	if (tmpAddr)
		window.currentAddress = tmpAddr;

	var setProfile = function(key, value) {
		return localStorage.setItem(key, value);
	};

	var getProfile = function(key) {
		return localStorage.getItem(key);
	};

	var removeProfile = function(key) {
		return localStorage.removeItem(key);
	}

	if (newTxid && newName) {

		fetch(window.trigger_url+"?TXID="+newTxid).then( function (response) {
			return response.json();
		}).then((result) => { console.log(result)});

		var temp = getProfile("registering");
		if (!temp)
			temp = "[]";

		var processing = JSON.parse(temp);
		for (var tt in processing) {
			if (processing[tt].name == newName) {
				processing.splice(tt, 1);
			}
		}
		processing.push({
			"name" : newName,
			"txid" : newTxid
		});

		setProfile("registering", JSON.stringify(processing));

		
	}
	else {

		var temp = getProfile("registering");
		if (temp) {
			var processing = JSON.parse(temp);
			for (var tt in processing) {

				fetch(window.trigger_url+"?TXID="+processing[tt].txid).then( function (response) {
					return response.json();
				}).then( (result) => { 
					processing[tt]["message"] = result.message;
				});
			}

		}
	}

	window.login = function(returnUrl, force) {
		if (!force) {
			currentAddress = getProfile("currentAddress");
			var tm = getProfile("timestamp");
			if (currentAddress && tm && parseInt(Date.now()/1000) - tm < 3600*24) {
				return;
			}
		}

		var random = Math.floor(Math.random() * 100000000);
		setProfile("login_random", random);

		var returnUrl = returnUrl || window.returnURL || "https://cryptoname.elaphant.app";

		var elaphantURL = "elaphant://identity?" +
							"AppID=" + window.ela_appID +
							"&AppName=" + encodeURIComponent(window.ela_appName) +
							"&RandomNumber="+random+
							"&DID=" + window.ela_developerDID +
							"&PublicKey=" + window.ela_publicKey +
							"&ReturnUrl=" + encodeURIComponent(returnUrl) +
							"&RequestInfo=ELAAddress,BTCAddress,ETHAddress";

		var url = "https://launch.elaphant.app/?appName="+encodeURIComponent(window.ela_appTitle)+
				  	"&appTitle="+encodeURIComponent(window.ela_appTitle)+
				  	"&autoRedirect=True&redirectURL="+encodeURIComponent(elaphantURL);

		//window.open(url, "_blank");
		window.location.href = url;
		return false;
	}

	window.logout = function() {
		removeProfile("currentAddress");
		removeProfile("userInfo");
		removeProfile("timestamp");
		currentAddress = "";
		window.href = window.returnURL;
	}


	// if (identityData) {
	// 	var identity = JSON.parse(identityData);
	// 	var sign = params.get("Sign");

	// 	if ( verify(identityData, sign, identity.PublicKey) && identity.RandomNumber == getProfile("random") ) {
	// 		currentAddress = identity.ETHAddress.toLowerCase();
	// 	}
	// 	else {
	// 		removeProfile("random");
	// 		//alert("Failed to log in to Elephant Wallet, please try again");
	// 		//window.location.href = window.location.href;
	// 		//return false;
	// 	}

	// 	setProfile("currentAddress", currentAddress);
	// 	setProfile("userInfo", JSON.stringify(identity));
	// 	setProfile("timestamp", parseInt(Date.now()/1000));
	// }
	// else {
	// 	var data = getProfile("userInfo");
	// 	if (data) {
	// 		identityData = data;
	// 	}
	// }



	var homePage = new Vue({
		el:"#home-main",
		data: {
			"loaded" : false,
			"cryptoName" : "",
			"currentPrice" : "",
			"nameResult" : false,
			"level1Price" : 0.0,
			"level2Price" : 0.0,
			"level3Price" : 0.0
		},
		methods: {
			checkNameAndPrice : function() {
				this.nameResult = false;
				this.cryptoName = this.cryptoName.trim().toLowerCase();
				if (this.cryptoName.length <3)
					this.currentPrice = this.level1Price;
				else if (this.cryptoName.length == 3)
					this.currentPrice = this.level2Price;
				else if (this.cryptoName.length > 3)
					this.currentPrice = this.level3Price;

				$("#input-name").removeClass("border-success").removeClass("text-success");
				$("#input-name").removeClass("border-danger").removeClass("text-danger");
				var pthis = this;
				window.crypton.getOwnerOfNameToken(this.cryptoName).then(function(owner) {
					if (!owner || owner == "") {
						pthis.nameResult = true;
						$("#input-name").removeClass("border-danger").removeClass("text-danger");
						$("#input-name").addClass("border-success").addClass("text-success");
					}
					else {
						pthis.nameResult = false;
						$("#input-name").removeClass("border-success").removeClass("text-success");
						$("#input-name").addClass("border-danger").addClass("text-danger");
					}
				});
			},
			register() {
				if (window.userInfo) {
					var url = window.returnURL+"/registerCryptoName.html?n="+this.cryptoName+"&r="+encodeURIComponent(window.returnURL);
					//window.open(url, "_blank");
					window.location.href = url;
					return false;
				}
				else {
					var url = window.returnURL+"/registerCryptoName.html?n="+this.cryptoName+"&r="+encodeURIComponent(window.returnURL)
					login(url, true);
				}
			}

		},
		created () {
		}
	});

	var accountPage = new Vue({
		el:"#account-main",
		data: {
			"loaded" : false,
			"myNames" : [],
			"registering" : []

		},
		methods: {
			updateMyNames : function(address, force) {
				var pthis = this;

				var temp = getProfile("registering");
				if (temp)
					this.registering = JSON.parse(temp);

				if (address && address !="") {
					this.myNames = JSON.parse(getProfile(address+"_names"));
					if (pthis.registering.length > 0) {
						for (var tt in this.myNames) {
							for (var nn in pthis.registering) {
								if (this.myNames[tt].name == pthis.registering[nn].name)
									pthis.registering.splice(nn, 1);
									setProfile("registering", JSON.stringify(pthis.registering));
							}
						}
						$('body').loading('stop');
					}

					window.crypton.getOwnerNameTokens(address).then(function(result) {
						pthis.myNames = result;

						if (pthis.registering.length > 0) {
							for (var tt in result) {
								for (var nn in pthis.registering) {
									if (result[tt].name == pthis.registering[nn].name)
										pthis.registering.splice(nn, 1);
										setProfile("registering", JSON.stringify(pthis.registering));
								}
							}
						}
						setProfile(address+"_names", JSON.stringify(result));
						setProfile(address+"_names_timestamp", parseInt(Date.now()/1000));
						$('body').loading('stop');
					});
				}
				else {
					$('body').loading('stop');	
				}
				

			},
			editName : function(name) {
				var url = window.returnURL+"/editCryptoName.html?n="+name+"&r="+encodeURIComponent(window.returnURL);
				window.location.href = url;
				return false;
			}

		},
		created () {
		}
	});

	var navbar = new Vue({
		el:"#navbar",
		data: {
			"loaded" : false
		},
		methods: {
			click : function(title, event) {

                $( "#home-main" ).addClass('d-none');
                $( "#account-main" ).addClass('d-none');
                $( "#"+title+"-main" ).removeClass('d-none');

                $( ".active").removeClass("active");
                $(event.target).addClass("active");

                $('.navbar-collapse').collapse('hide');

                if (title == "account") {
                	$('body').loading({
					  onStart: function(loading) {
					    loading.overlay.slideDown(400);
					  },
					  onStop: function(loading) {
					    loading.overlay.slideUp(400);
					  }
					});
                	if (!window.currentAddress || window.currentAddress == "") {
                		var url = window.returnURL;
                		if (url.indexOf('?') >= 0)
                			url += "&tab=account";
                		else
                			url += "?tab=account";

                		login(url);
                	}

					accountPage.updateMyNames(currentAddress);
                }
			}

		},
		created () {

		}
	});

	window.crypton.getCurrentPrice(3).then(function(price) {
		homePage.level3Price = price;
		return crypton.getCurrentPrice(2);
	}).then(function(price) {
		homePage.level2Price = price;
		return crypton.getCurrentPrice(1);
	}).then(function(price) {
		homePage.level1Price = price;
	}).then(function() {
		navbar.loaded = true;
		homePage.loaded = true;
		accountPage.loaded = true;
		$('body').loading('stop');
	}).catch(function(error) {
		$('body').loading('stop');
	});

	if (tabPage && tabPage == "account") {
		$("li[data-target='account-main']").trigger("click");
		// window.crypton.getOwnerNameTokens(currentAddress).then(function(result) {
		// 	accountPage.myNames = result;
		// 	//navbar.click("account");
		// });
	}

	Date.prototype.Format = function (fmt) {
		var o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S": this.getMilliseconds() 
		};
		if (/(y+)/.test(fmt)) 
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) 
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

		return fmt;
	}
});