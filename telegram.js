class TelegramBot { 
  constructor() {    
    this.user_id = null;
    this.user_name = null;
    this.start_value = null;
    this.is_premium = null;
    this.platform = null;
    this.language_code = null;

    document.addEventListener('DOMContentLoaded', function() {
          if (window.Telegram && window.Telegram.WebApp) {
            // 웹 앱 초기화 완료 후 사용자 정보 접근
            const tg = window.Telegram.WebApp;
            const user = window.Telegram.WebApp.initDataUnsafe.user;           
            
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.enableClosingConfirmation();

            window.Telegram.WebApp.onEvent('viewportChanged', function() {
              if (!window.Telegram.WebApp.isExpanded) {
                  // 미니앱이 닫힐 때
                  window.unityInstanceRef.SendMessage('TelegramBotManager', 'OnTelegramAppClosed');
              }
          });

            // 사용자 정보 확인 및 출력
            if (user) {
              const userId = user.id;
              const userName = user.username;
              const firstName = user.first_name;
              const lastName = user.last_name;
              const startValue = window.Telegram.WebApp.initDataUnsafe.start_param;
              const premium = user.is_premium;
              const languageCode = user.language_code;
              const platform = window.Telegram.WebApp.platform;

              // userId와 userName을 전역 변수 또는 다른 곳에 저장하려면
              this.user_id = userId;
              this.user_name = firstName + " " + lastName;
              this.start_value = startValue;
              this.is_premium = premium;
              this.platform = platform;             
              this.language_code = languageCode;

              console.log("User ID:", userId);
              console.log("User Name:", userName);
              console.log("User Name:", startValue);

              //alert("User ID: " + this.user_id + ", User Name: " + this.user_name);
            } else {
                console.log("User information is not available.");                
                //alert("User information is not available.");                
            }
        } else {
          console.log("Telegram WebApp is not available.");          
          //alert("Telegram WebApp is not available.");          
        }
    }.bind(this));
  }

  waitUntil(conditionFunction, timeoutMs) {
    const poll = resolve => {
        if (conditionFunction()) resolve(true);
        else setTimeout(() => poll(resolve), 100); // 100ms 간격으로 체크
    };

    const timeout = new Promise(resolve => setTimeout(() => resolve(false), timeoutMs));

    return Promise.race([new Promise(poll), timeout]);
  }  

  setCloseMessage(message){
    this.closeMessage = message;
  }

  setUserId(userId){
    this.user_id = userId;
  }

  async getUserInfo(){
    let userInfo = {
      userId: 0,
      userName: "",
      startValue: "",
      platform: "",
      premium: false,
      language_code: "en",

      initData: ""
    }

    const success = await this.waitUntil( () => this.user_id != null &&
    this.user_name != null, 3000 );
    if (success){
      //const user = window.Telegram.WebApp.initDataUnsafe.user;

        userInfo.userId = this.user_id;
        userInfo.userName = this.user_name;
        userInfo.startValue = this.start_value;
        userInfo.platform = this.platform;
        userInfo.premium = this.is_premium;
        userInfo.language_code = this.language_code;
        userInfo.initData = window.Telegram.WebApp.initData;
        console.log("Get User ID:", userInfo.userId);   
        console.log("Get User NAME:", userInfo.userName);
        console.log("Get User Start Value:", userInfo.startValue);        
    }
    else{
      this.userName = "Failed";
      console.log("Telegram is null : ", this.user_id, this.user_name );       
    }

    return userInfo;
  }

  async sendGame(token, chatId, gameShortName){
    const response = await fetch(`https://api.telegram.org/bot${token}/sendGame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        game_short_name: gameShortName
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
  }

  async sendMessage(token, chatId, message) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
  }

  async setGameScore(token, userId, score, chatId, messageId) {
    const response = await fetch(`https://api.telegram.org/bot${token}/setGameScore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        score: score,
        chat_id: chatId,
        message_id: messageId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to set game score: ${response.statusText}`);
    }

    return await response.json();
  }

  async getGameHighScores(token, userId, chatId, messageId){   
    const response = await fetch(`https://api.telegram.org/bot${token}/getGameHighScores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        chat_id: chatId,
        message_id: messageId
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to get game high score: ${response.statusText}`);
    }
    return await response.json();
  }

  inviteFriend(botUserName, appName, memberId){
    const url = `https://t.me/${botUserName}/${appName}?startapp=${memberId}`;    
    const inviteLink = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
    
    //document.getElementById('inviteLink').href = inviteLink;
    //window.open(gameInviteUrl, '_blank');
    window.open(inviteLink, '_blank');
  } 

  async sendInvoice(token, chatId, star){
    const invoice = {
      chat_id: chatId,
      title : 'Test Product',
      description: 'This is a test product',
      payload: 'test-payload',      
      currency: 'XTR',
      prices: [
        { label: 'Test Product_1', amount: star }        
      ]
    };

    const response = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoice)
    });

    if (!response.ok) {
      throw new Error(`Failed to invoice: ${response.statusText}`);
    }

    const data = await response.json();    
    const paymentUrl = data.result;
    window.open(paymentUrl, '_blank');
    return await data;
  }

  async sendInvoice_V2( token, invoiceInfo ){
    const response = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceInfo)
    });

    if (!response.ok) {
      throw new Error(`Failed to invoice: ${response.statusText}`);
    }

    const data = await response.json();    
    const paymentUrl = data.result;
    window.open(paymentUrl, '_blank');

    return await data;
  }

  closeEvent(){   
    Telegram.WebApp.showAlert(this.closeMessage).then( (result) => {
      if( result ){
        this.closeApp();
      }      
    } );
  }
  closeApp(){
    window.Telegram.WebApp.close();
  }
}
