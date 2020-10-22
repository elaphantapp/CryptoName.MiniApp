const url = new URL(window.location.href.replace("#", ""));
var entryURL = url.href;
window.returnURL = window.location.href.split('?')[0];

let params = new URLSearchParams(url.search.substring(1));
const cryptoName = params.get("n");

var transferPage = new Vue({
	el: "#transferPage",
	data: {
		"toCryptoName": "",
		"transferAddress": ""
	},
	methods: {
		transfer: function () {

			if (this.transferAddress === "") {
				alert("Enter address for the transfer")
				return false;
			}
			window.crypton.transfer(this.transferAddress, cryptoName).then(function () {
				console.log("transfer done.");
				window.history.go(-1);
			}).catch(function (err) {
				console.log(err);
			})
		},
		transferDiagChange() {
			var name = this.toCryptoName;
			if (name.length >= 24)
				return;
			var pthis = this;
			Crypton.QueryKey(name, "eth.address")
				.then(function (address) {
					pthis.transferAddress = address;
					console.log(address)

				}, function () {

				}).catch((err) => {
					console.log(err)
				});

		},
	},
});