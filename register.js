$(function () {

	const url = new URL(window.location.href.replace("#", ""));
	var entryURL = url.href;

	let params = new URLSearchParams(url.search.substring(1));
	//var identityData = params.get("Data");
	var TXID = params.get("TXID");

	window.cryptoName = params.get("n");
	window.returnURL = params.get("r") || window.location.href.split('?')[0];

	if (!window.cryptoName)
		window.cryptoName = "";


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
			"email" : "",
			"depositAmount" : 0.5,
			"totalAmount" : 0.0,
			"enableEmail" : 0
		},
		methods: {
			pay : function() {

				// var domainInfo = {
				// 	"name": this.cryptoName.trim().toLowerCase(),
				// 	"did": this.DID,
				// 	"publickey": this.publicKey.trim(),
				// 	"ela.address": this.elaAddress.trim(),
				// 	"btc.address": this.btcAddress.trim(),
				// 	"eth.address": this.ethAddress.trim().toLowerCase(),
				// 	"email": this.email.trim()
				// };
				// var returnUrl = window.returnURL + (window.returnURL.indexOf('?')<0 ? "?new=" : "&new=") + domainInfo.name;
				// //window.location.href.split('?')[0] + "?r=" + encodeURIComponent(window.returnURL);
				// //var callbackUrl = window.trigger_url;
				// var orderID = "Referrer:elaphant;Owner:"+this.ethAddress+";Data:"+btoa(JSON.stringify(domainInfo));

				// var elaphantURL = "elaphant://elapay?DID=" + window.ela_developerDID +
				// 				 "&AppID=" + window.ela_appID +
				// 				 "&AppName=" + encodeURIComponent(window.ela_appName) +
				// 				 "&Description=" + encodeURIComponent(window.ela_appName) +
				// 				 "&PublicKey="+ window.ela_publicKey +
				// 				 "&OrderID=" + orderID +
				// 				 "&CoinName=ELA"+
				// 				 "&ReceivingAddress=" + window.ela_proxyAddress +
				// 				 "&Amount=" + this.totalAmount +
				// 				 "&ReturnUrl=" + encodeURIComponent(returnUrl);
				// 				 //"&CallbackUrl=" + encodeURIComponent(callbackUrl);

				// var url = "https://launch.elaphant.app/?appName="+encodeURIComponent(window.ela_appTitle)+
				// 		  	"&appTitle="+encodeURIComponent(window.ela_appTitle)+
				// 		  	"&autoRedirect=True&redirectURL="+encodeURIComponent(elaphantURL);
				// window.location.href = url;
				// //window.open(url);
				// return false;

				this.register()
			},
			submitChange : function() {

			},
			register: function() {
				const name = this.cryptoName.trim().toLowerCase()
				const depositAmount = this.depositAmount
				window.crypton.getOwnerOfNameToken(name)
				.then (function(addr) {
					if (addr == "") 
						console.log("TESTING: getownerOfNameToken(NotExist) is OK!");
					// 获取最新价格，1表示1-2个字母，2表示3个字母，3表示4个及以上字母
					return crypton.getCurrentPrice(3);
				})
				.then (function(price) {
					console.log("getCurrentPrice done. " + price);
					// 注册名字
					//nameprice + deposit + service fee
					// console.log(""+(parseFloat(price)+depositAmount+0.5))
					const totalPrice = parseFloat(price)+depositAmount+0.5 + 0.01;
					return crypton.registerName(name, ""+totalPrice);
				}).then (function() {
					console.log("registerName done.");
				}).catch(function(err){
					console.log(err);
				})
			}
		},
		created () {
		}
	});


	initWallet().then(function(result) {
		if (window.userInfo) {
			registerPage.cryptoName = window.cryptoName;
			registerPage.DID = window.userInfo.DID;
			registerPage.elaAddress = window.userInfo.ELAAddress;
			registerPage.ethAddress = window.userInfo.ETHAddress;
			registerPage.btcAddress = window.userInfo.BTCAddress;
			registerPage.publicKey = window.userInfo.PublicKey;
		}
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

	if (TXID) {
		$("#waiting-close").click(function() {
			$("#waitingbox").modal('hide');
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