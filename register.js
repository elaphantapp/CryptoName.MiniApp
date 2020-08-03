$(function () {

	const url = new URL(window.location.href);
	var entryURL = url.href;
	window.returnURL = window.location.href.split('?')[0];

	let params = new URLSearchParams(url.search.substring(1));
	var identityData = params.get("Data");
	window.cryptoName = params.get("n");

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
			if (currentAddress && tm && parseInt(Date.now()/1000) - tm < 3600*24)
				return;
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

		window.location.href = url;		
	}

	window.logout = function() {
		removeProfile("currentAddress");
		removeProfile("userInfo");
		removeProfile("timestamp");
		currentAddress = "";
		window.href = window.returnURL;
	}


	var registerPage = new Vue({
		el:"#registerPage",
		data: {
			"cryptoName" : window.cryptoName.trim().toLowerCase(),
			"namePrice" : 0.0,
			"DID" : "",
			"elaAddress" : "",
			"btcAddress" : "",
			"ethAddress" : "",
			"publicKey" : "",
			"signature" : "",
			"depositAmount" : 0.5,
			"totalAmount" : 0.0,
			"enableMessenger" : 0
		},
		methods: {
			pay : function() {

				var domainInfo = {
					"name": this.cryptoName.trim().toLowerCase(),
					"did": this.DID,
					"publickey": this.publicKey.trim(),
					"ela.address": this.elaAddress.trim(),
					"btc.address": this.btcAddress.trim(),
					"eth.address": this.ethAddress.trim().toLowerCase(),
					"messenger": this.signature.trim()
				};
				var proxyAddress = "Eavc2YWHuMD5GdA7vagi6eFKUQHDK5qHeF";
				var appTitle = "CryptoName";
				var developerDID = "ibxNTG1hBPK1rZuoc8fMy4eFQ96UYDAQ4J";
				var appID = "ac89a6a3ff8165411c8426529dccde5cd44d5041407bf249b57ae99a6bfeadd60f74409bd5a3d81979805806606dd2d55f6979ca467982583ac734cf6f55a290";
				var appName = "Mini Apps";
				var publicKey = "034c51ddc0844ff11397cc773a5b7d94d5eed05e7006fb229cf965b47f19d27c55";
				var returnUrl = "https://cryptoname.elaphant.app";
				var orderID = "Referrer:elaphant;Owner:"+this.ethAddress+";Data:"+btoa(JSON.stringify(domainInfo));

				var elaphantURL = "elaphant://elapay?DID=" + developerDID +
								 "&AppID=" + appID +
								 "&AppName=" + encodeURIComponent(appName) +
								 "&Description=" + encodeURIComponent(appName) +
								 "&PublicKey="+ publicKey +
								 "&OrderID=" + orderID +
								 "&CoinName=ELA"+
								 "&ReceivingAddress=" + proxyAddress +
								 "&Amount=" + this.totalAmount +
								 "&ReturnUrl=" + encodeURIComponent(returnUrl);

				var url = "https://launch.elaphant.app/?appName="+encodeURIComponent(appTitle)+
						  	"&appTitle="+encodeURIComponent(appTitle)+
						  	"&autoRedirect=True&redirectURL="+encodeURIComponent(elaphantURL);
				//window.location.href = url;
				window.open(url);
			}
		},
		created () {
		}
	});

	if (identityData) {
		var identity = JSON.parse(identityData);

		registerPage.cryptoName = window.cryptoName;
		registerPage.DID = identity.DID;
		registerPage.elaAddress = identity.ELAAddress;
		registerPage.ethAddress = identity.ETHAddress;
		registerPage.btcAddress = identity.BTCAddress;
		registerPage.publicKey = identity.PublicKey;

	}

	initWallet().then(function(result) {
		if (!window.crypton)
			alert("Init Web3 Provider failed, please restart browser and try again.");
		var level = 0;
		if (cryptoName.length < 3)
			level = 1;
		else if (cryptoName.length == 3)
			level = 2;
		else
			level = 3;
		window.crypton.getCurrentPrice(level).then(function(price) {
			registerPage.namePrice = price;
		});
	});


});