class Ton_Connect {
    constructor() {
        this.address = "";
        this.publickey = "";
        this.init = false;

        console.log( 'Initialize TonConnect.' );
        this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://ton1-hdfaateuczftgmh8.z03.azurefd.net/tonconnect-manifest.json'            
        });

        this.tonConnectUI.uiOptions = {
            twaReturnUrl: 'https://t.me/Banacus_Bot/Banacus'
        };

        this.tonConnectUI.onStatusChange(wallet => {
            this.setWalletAddress(wallet);
        });
    }

    async setWalletAddress(wallet){
        let connectInfo = {
            connect: true,
            address: "",
            publickey: ""
          }           

        if(wallet){                
            this.address = await this.fetchBase64urlAddress(wallet.account.address);
            this.publickey = wallet.account.publicKey;
            console.log('Connected Wallet Address:', this.address);
            console.log('Connected Wallet Public Key:', this.publickey);
        }
        else{
            this.address = "";
            console.log('No wallet connected');
        }

        connectInfo.address = this.address;
        connectInfo.publicKey = this.publickey;

        if( this.init === true )
            window.unityInstanceRef.SendMessage('TonConnectManager', 'OnConnectedWallet', JSON.stringify(connectInfo));        
    }   

    async fetchBase64urlAddress(rawAddress){
        const ur = encodeURIComponent(rawAddress);
        console.log("First Address:", ur);
        const apiUrl = `https://toncenter.com/api/v2/detectAddress?address=${encodeURIComponent(rawAddress)}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();

            if (data.ok) {
                console.log("Raw Address:", data.result.non_bounceable.b64url);
                return data.result.non_bounceable.b64url;
            } else {
                console.log("Invalid address or error in fetching address data : ", data.statusText);
                return "";
            }
        } catch (error) {
            console.error("Error fetching address data:", error);
            return "";
        }
    }

    async isConnectWallet(){
        let connectInfo = {
            connect: false,
            address: "",
            publickey: ""
          }

        this.init = true;

        this.tonConnectUI.connectionRestored.then( restored => {
            connectInfo.connect = restored;
            if( restored ){
                console.log('Connection restored. Wallet:',
                    this.tonConnectUI.wallet,
                    this.tonConnectUI.walletInfo
                );

                connectInfo.connect = restored;
                connectInfo.address = this.address;
                connectInfo.publickey = this.publickey;            
            }
        } );        
        return connectInfo;
    }

    async connectWallet() {
        let connectInfo = {
            connect: true,
            address: "",
            publickey: ""
          }               

        console.log( 'Connect Wallet Call JS11111' );
        //const connectWallet = await this.tonConnectUI.connectWallet();              
        const connectWallet = await this.tonConnectUI.openSingleWalletModal('telegram-wallet');

        console.log( 'Connect Wallet Call JS22222' );
        //await this.setWalletAddress( connectWallet );
        //connectInfo.address = this.address;
        //connectInfo.publicKey = this.publickey;
        return connectInfo;         
    }        

    async openWallet(){
        console.log( 'Connection restored Wallet' );                
        console.log('Wallet Info :', JSON.stringify(this.tonConnectUI.walletInfo));                            
        window.open(this.tonConnectUI.walletInfo.universalLink, '_blank');

        const walletList = await this.tonConnectUI.getWallets();
        return walletList;           
    }

    async sendTransaction(tonAddress, tonAmount, tonPayload){
        try {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600,
                messages: [
                    {
                        adress: tonAddress,
                        amount: tonAmount,
                        payload: tonPayload
                    }
                ],
            };

            const result = await this.tonConnectUI.sendTransaction(transaction);
            const someTxData = await myAppExplorerService.getTransaction(result.boc);

            return result;
        }
        catch(error){
            throw new Error(`Failed to Transaction: ${error}`);
        }
    }

    async disconnectWallet(){
        try {
            await this.tonConnectUI.disconnect();
            console.log('Wallet disconnected successfully.');

            return true;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }

        return false;
    }
}
// 모듈을 export하여 다른 스크립트에서 사용할 수 있도록 합니다.
export default Ton_Connect;   
