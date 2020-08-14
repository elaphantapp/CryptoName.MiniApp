
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
    return new Promise((resolve, reject) => {
        window.web3 = new Web3(new Web3.providers.HttpProvider(window.provider_url));
        window.crypton = new Crypton(window.abiArray, window.contract_address, window.web3);
        resolve("http_provider");
    });
};
