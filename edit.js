initWallet().then(function(result) {
	if (!window.crypton) {
		alert("Init Web3 Provider failed, please restart browser and try again.");
		return;
	}

	const url = new URL(window.location.href.replace("#", ""));
	var entryURL = url.href;
	window.returnURL = window.location.href.split('?')[0];

	let params = new URLSearchParams(url.search.substring(1));
	var TXID = params.get("TXID");

	window.cryptoName = params.get("n");
	window.returnURL = params.get("r") || window.location.href.split('?')[0];

	if (!window.cryptoName)
		window.cryptoName = "";


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
		setProfile("login_random", random);

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
		return
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
			"ethAddress" : "",
			"domainInfo" : {},
			"newKey" : "",
			"newValue" : ""
		},
		methods: {
			submitChange : function(type, key, value) {

				if (type == "set") 
					window.crypton.setKeyword(window.cryptoName, key, value);
				else
					window.crypton.removeKeyword(window.cryptoName, key);

				return;

				var amount = 0;
				var gasPrice = 1000000000;
				var gas = 10000;
				var abiData;

				if (type == "set") 
					abiData = window.crypton._contact.methods.setKeyword(window.cryptoName, key, value).encodeABI();
				else if (type == "remove")
					abiData = window.crypton._contact.methods.removeKeyword(window.cryptoName, key).encodeABI();

				var returnUrl = window.location.href.split('?')[0] + "?r=" + encodeURIComponent(window.returnURL);

				var elaphantURL = "elaphant://calleth?DID=" + window.ela_developerDID +
					"&AppID=" + window.ela_appID +
					"&AppName=" + encodeURIComponent(window.ela_appName) +
					"&Description=" + encodeURIComponent(window.ela_appName) +
					"&PublicKey=" + window.ela_publicKey +
					//"&OrderID=" + orderID +
					"&CoinName=Ethsc" +
					"&to=" + window.contract_address +
					"&value=" + amount +
					"&price=" + gasPrice +
					"&gas=" + gas +
					"&data=" + abiData +
					"&ReturnUrl=" + encodeURIComponent(returnUrl);

				var url = "https://launch.elaphant.app/?appName=" + encodeURIComponent(window.ela_appTitle) +
					"&appTitle=" + encodeURIComponent(window.ela_appTitle) +
					"&autoRedirect=True&redirectURL=" + encodeURIComponent(elaphantURL);
				window.location.href = url;
				return false;
			}
		},
		created () {
			window.crypton.getNameProfile(cryptoName).then(function(result) {
				registerPage.cryptoName = result.name;
				registerPage.ethAddress = result["eth.address"];
				registerPage.domainInfo = result;
			});
		}
	});



	if (TXID) {
		$("#waiting-close").click(function() {
			$("#waitingbox").modal('hide');
			//window.open(window.returnURL);
			window.location.href = window.returnURL;
			return false;
		});

		$("#waitingbox").modal({backdrop: 'static', keyboard: false});
		$("#waitingbox").modal('show');
		fetch(window.trigger_url+"?TXID="+TXID).then( function (response) {
			return response.json();
		}).then(function(result) {
			$("#waiting-title").text("Finish!");
			$("#waiting-p1").text("Result code: "+result.code);
			$("#waiting-p2").text("Message: "+result.message);
		});
		return;
	}

});