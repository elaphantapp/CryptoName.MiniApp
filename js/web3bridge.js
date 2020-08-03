
window.TEST = true;

if (window.TEST) {
	window.elaeth_blocknumber_url = "https://explorer.elaeth.io/api?module=block&action=eth_block_number";
	window.contract_address = "0xefdb328c09b6e20314fe201a5dba74cf36ef8bdd";
    window.provider_url = "https://ropsten.infura.io/v3/9696ce3787ed44efad995c28547803e1";
}
else {
	window.elaeth_blocknumber_url = "https://explorer.elaeth.io/api?module=block&action=eth_block_number";
	window.contract_address = "0xc4032babad2b76c39abec3c4e365611de78528ed";
    window.provider_url = "https://mainrpc.elaeth.io";
}


window.initWallet = function initWallet() {
    return new Promise((resolve, reject) => {
        if (typeof window.ethereum === 'undefined') {
            window.web3 = new Web3(new Web3.providers.HttpProvider(window.provider_url));
			window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
            resolve("http_provider");
        } else {
            //resolve(1);
            ethereum.enable().then(() => {
                window.web3 = new Web3(ethereum);
                var selectedAddress = ethereum.selectedAddress;
                window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
                resolve(selectedAddress);


            }).catch((reason) => {
                reject(reason);
            });
            ethereum.on('accountsChanged', function (accounts) {
                window.location.href = window.location.href;
            });
            ethereum.on('networkChanged', function (accounts) {
                window.location.href = window.location.href;
            });
        }
    });
};
