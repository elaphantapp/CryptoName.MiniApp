
window.initWallet().then(function(result) {
	if (!window.crypton)
		alert("Init Web3 Provider failed, please restart browser and try again.");

	const url = new URL(window.location.href.replace("#", ""));
	var entryURL = url.href;
	window.returnURL = window.location.href.split('?')[0].replace("#", "");

	let params = new URLSearchParams(url.search.substring(1));
	var identityData = params.get("Data");
	var currentAddress = params.get("address");
	var tabPage = params.get("tab");

	var setProfile = function(key, value) {
		return localStorage.setItem(key, value);
	};

	var getProfile = function(key) {
		return localStorage.getItem(key);
	};

	var removeProfile = function(key) {
		return localStorage.removeItem(key);
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
		setProfile("random", random);

		var appTitle = "CryptoName";
		var developerDID = "ibxNTG1hBPK1rZuoc8fMy4eFQ96UYDAQ4J";
		var appID = "ac89a6a3ff8165411c8426529dccde5cd44d5041407bf249b57ae99a6bfeadd60f74409bd5a3d81979805806606dd2d55f6979ca467982583ac734cf6f55a290";
		var appName = "Mini Apps";
		var publicKey = "034c51ddc0844ff11397cc773a5b7d94d5eed05e7006fb229cf965b47f19d27c55";
		var returnUrl = returnUrl || window.returnURL || "https://cryptoname.elaphant.app";

		var elaphantURL = "elaphant://identity?" +
							"AppID=" + appID +
							"&AppName=" + encodeURIComponent(appName) +
							"&RandomNumber="+random+
							"&DID=" + developerDID +
							"&PublicKey=" + publicKey +
							"&ReturnUrl=" + encodeURIComponent(returnUrl) +
							"&RequestInfo=ELAAddress,BTCAddress,ETHAddress";

		var url = "https://launch.elaphant.app/?appName="+encodeURIComponent(appTitle)+
				  	"&appTitle="+encodeURIComponent(appTitle)+
				  	"&autoRedirect=True&redirectURL="+encodeURIComponent(elaphantURL);

		window.open(url, "_blank");
	}

	window.logout = function() {
		removeProfile("currentAddress");
		removeProfile("userInfo");
		removeProfile("timestamp");
		currentAddress = "";
		window.href = window.returnURL;
	}


	if (identityData) {
		var identity = JSON.parse(identityData);
		var sign = params.get("Sign");

		if ( verify(identityData, sign, identity.PublicKey) && identity.RandomNumber == getProfile("random") ) {
			currentAddress = identity.ETHAddress.toLowerCase();
		}
		else {
			alert("Failed to log in to Elephant Wallet, please try again");
			return;
		}

		setProfile("currentAddress", currentAddress);
		setProfile("userInfo", JSON.stringify(identityData));
		setProfile("timestamp", parseInt(Date.now()/1000));
	}
	else {
		var data = getProfile("userInfo");
		if (data) {
			identityData = JSON.parse(data);
		}
	}



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
				if (identityData) {
					var url = window.returnURL+"/registerCryptoName.html?n="+this.cryptoName+"&Data="+encodeURIComponent(JSON.stringify(identityData))+"&r="+encodeURIComponent(window.returnURL);
					window.open(url);
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
			"myNames" : []
		},
		methods: {
			updateMyNames : function(address, force) {
				var pthis = this;

				if (address && address !="") {
					this.myNames = JSON.parse(getProfile(address+"_names"));

					window.crypton.getOwnerNameTokens(address).then(function(result) {
						pthis.myNames = result;
						setProfile(address+"_names", JSON.stringify(result));
						setProfile(address+"_names_timestamp", parseInt(Date.now()/1000));
					});
				}

			},

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
                	if (!currentAddress || currentAddress == "") {
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