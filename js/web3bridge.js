
window.TEST = true;

if (window.TEST) {
	window.elaeth_blocknumber_url = "https://explorer.elaeth.io/api?module=block&action=eth_block_number";
	window.contract_address = "0xefdb328c09b6e20314fe201a5dba74cf36ef8bdd";
    window.provider_url = "https://ropsten.infura.io/v3/9696ce3787ed44efad995c28547803e1";
    window.trigger_url = "https://api-test.elastos.name/nameInfo/buy";
}
else {
	window.elaeth_blocknumber_url = "https://explorer.elaeth.io/api?module=block&action=eth_block_number";
	window.contract_address = "0xc4032babad2b76c39abec3c4e365611de78528ed";
    window.provider_url = "https://mainrpc.elaeth.io";
}


window.initWallet = function initWallet() {
    const url = new URL(window.location.href.replace("#", ""));
    let params = new URLSearchParams(url.search.substring(1));
    var identityData = params.get("Data");
    var identity = identityData ? JSON.parse(identityData) : undefined;
    var sign = params.get("Sign");

    if (sign && identity) {
        // identity callback

        if ( verify(identityData, sign, identity.PublicKey) && identity.RandomNumber == localStorage.getItem("login_random") ) {
            window.currentAddress = identity.ETHAddress.toLowerCase();
            window.userInfo = identity;
            window.currentAddress = identity.ETHAddress;
            localStorage.setItem("login_currentAddress", identity.ETHAddress);
            localStorage.setItem("login_userinfo", JSON.stringify(identity));
            localStorage.setItem("login_timestamp", parseInt(Date.now()/1000));
        }

    }
    else {
        var address = localStorage.getItem("login_currentAddress");
        var identityData = localStorage.getItem("login_userinfo");
        var timestamp = localStorage.getItem("login_timestamp");

        if (address && identityData && timestamp) {
            if (parseInt(Date.now()/1000) - timestamp > 86400) {
                localStorage.removeItem("login_currentAddress");
                localStorage.removeItem("login_userinfo");
                localStorage.removeItem("login_timestamp");
                localStorage.removeItem("login_random");
            }
            else {
                window.userInfo = JSON.parse(identityData);
                window.currentAddress = window.userInfo.ETHAddress;
            }
        }
    }

    return new Promise((resolve, reject) => {
        if (typeof window.ethereum === 'undefined') {

            var ElaProvider = undefined;

            if (window.currentAddress) {
                ElaProvider = ElaphantWeb3Provider.initWithConfig({"rpcUrl": window.provider_url, "address": window.currentAddress});
            }
            else {
                var appTitle = "CryptoName";
                var developerDID = "ibxNTG1hBPK1rZuoc8fMy4eFQ96UYDAQ4J";
                var appID = "ac89a6a3ff8165411c8426529dccde5cd44d5041407bf249b57ae99a6bfeadd60f74409bd5a3d81979805806606dd2d55f6979ca467982583ac734cf6f55a290";
                var appName = "Mini Apps";
                var publicKey = "034c51ddc0844ff11397cc773a5b7d94d5eed05e7006fb229cf965b47f19d27c55";
                var random = Math.floor(Math.random() * 100000000);
                localStorage.setItem("login_random", random);
                ElaProvider = ElaphantWeb3Provider.initWithParams(window.provider_url, appTitle, appID, appName, publicKey, developerDID, random);
            }

            window.web3 = new Web3(ElaProvider);
            //window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
        }

        if (window.ethereum) {
            window.ethereum.enable().then( () => {
                window.currentAddress = ethereum.selectedAddress;
                window.web3 = new Web3(new Web3.providers.HttpProvider(window.provider_url));
                window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
                resolve(window.currentAddress);
            });
        }
        // window.ethereum.request({ method: 'eth_requestAccounts' }).then(function(address) {
        // });   

        // else {
        //     window.web3 = new Web3(new Web3.providers.HttpProvider(window.provider_url));
        //     window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
        //     resolve("http_provider");
        // }
    });
};
