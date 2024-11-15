// window.addEventListener("load", function () {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('ServiceWorker.js').then((registration) => {
//         console.log('Service Worker registered with scope:', registration.scope);

//         registration.onupdatefound = () => {
//             const installingWorker = registration.installing;
//             installingWorker.onstatechange = () => {
//                 if (installingWorker.state === 'installed') {
//                     if (navigator.serviceWorker.controller) {
//                         console.log('New or updated content is available.');
//                         if (confirm('새로운 업데이트가 있습니다. 페이지를 새로고침하시겠습니까?')) {
//                             window.location.reload(true);
//                         }
//                     } else {
//                         console.log('Content is now available offline!');
//                     }
//                 }
//             };
//         };
//     }).catch((error) => {
//         console.log('Service Worker registration failed:', error);
//     });
//   }
// });

var currentVersion = "1.0.01";
var storedVersion = localStorage.getItem('gameVersion');

if (!storedVersion || storedVersion !== currentVersion) {
  localStorage.setItem('gameVersion', currentVersion);
  if (storedVersion) {
    // 버전이 다르면 페이지 새로고침    
      window.location.reload(true);
    }
  }

var unityInstanceRef;
var unsubscribe;
var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");

// 새로운 로딩 오버레이 요소 선택
var loadingOverlay = document.getElementById('loading-overlay');
var loadingProgress = document.getElementById('loading-progress');

// 로딩 진행률 업데이트 함수
function updateLoadingProgress(progress) {
  loadingProgress.style.width = `${progress * 100}%`;
}

function unityShowBanner(msg, type) {
  // 기존 unityShowBanner 함수 내용
}

var buildUrl = "Build";
var loaderUrl = buildUrl + "/TelegramPurchaseTest.loader.js?id=1.0.01";
var config = {
  dataUrl: buildUrl + "/TelegramPurchaseTest.data?id=1.0.01",
  frameworkUrl: buildUrl + "/TelegramPurchaseTest.framework.js?id=1.0.01",
  codeUrl: buildUrl + "/TelegramPurchaseTest.wasm?id=1.0.01",
  symbolsUrl: buildUrl + "/?id=1.0.01",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "Monoverse",
  productName: "TelegramPurchase",
  productVersion: "1.0.01",

  // cacheControl: function (url) {
  //   if (url.match(/\.data/) || url.match(/\.bundle/)) {
  //     return "must-revalidate";
  //   }
  //   return "no-store";
  // },

  showBanner: false,
  splashScreenStyle: "None",
};

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

function initializeTelegramBot() {
  if (!window.TelegramBotInstance) {
    window.TelegramBotInstance = new TelegramBot();
    console.log("TelegramBot instance created with token:");
  } else {
    console.log("TelegramBot instance already initialized.");
  }
}

initializeTelegramBot();

import Ton_Connect from './ton_connect.js';

function initializeTonConnect() {
  if(!window.tonConnectInstance){
    window.tonConnectInstance = new Ton_Connect();
    console.log("TonConnect instance created");
  }
  else{
    console.log("TonConnect instance already initialized.");
  }
}
initializeTonConnect();
function createUnity() {
  loadingOverlay.style.display = "flex"; // 로딩 오버레이 표시
  
  var script = document.createElement("script");
  script.src = loaderUrl;
  script.onload = () => {
    let lastProgress = 0;
    let isLoading = true;

    function smoothProgress() {
      if (isLoading && lastProgress < 1) {
        lastProgress = Math.min(lastProgress + 0.005, 1);
        updateLoadingProgress(lastProgress);
        requestAnimationFrame(smoothProgress);
      }
    }

    createUnityInstance(canvas, config, (progress) => {
      if (progress <= 0.9) {
        lastProgress = progress;
        updateLoadingProgress(progress);
      } else if (progress > 0.9 && progress < 1) {
        lastProgress = 0.9 + (progress - 0.9) * 0.8; // 90% 이후 약간 천천히 증가
        updateLoadingProgress(lastProgress);
      }
    }).then((unityInstance) => {
      window.unityInstanceRef = unityInstance;
      isLoading = false;

      // 로딩이 완료된 후 빠르게 100%까지 채우기
      let finalizeProgress = () => {
        if (lastProgress < 1) {
          lastProgress = Math.min(lastProgress + 0.05, 1);
          updateLoadingProgress(lastProgress);
          requestAnimationFrame(finalizeProgress);
        } else {
          // 로딩바가 100%에 도달한 즉시 오버레이 숨김
          loadingOverlay.style.display = "none";
          container.style.display = "block";
          canvas.style.display = "block";
        }
      };

      finalizeProgress();
    }).catch((message) => {
      alert(message);
    });

    smoothProgress(); // 부드러운 진행을 위한 함수 호출
  };
  document.body.appendChild(script);
}

createUnity();

function exitGame() {
  if (window.unityInstanceRef) {      
    hideUnity();
  }
}
window.exitGame = exitGame;

function hideUnity(){
  if (window.unityInstanceRef) {
    document.querySelector("#unity-container").style.display = "none";
  }
}

function showUnity(){
  if(window.unityInstanceRef){
    document.querySelector("#unity-container").style.display = "block";
  }
  else{
    createUnity();
  }
}

function getIPAddress(){
  return fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => data.ip)
  .catch(error => {
    console.error('IP 주소를 가져오는 중 오류 발생:', error);
    return null;
  });
}

// function triggerVibration(milliseconds) {
//   if (navigator.vibrate) {
//       navigator.vibrate(milliseconds);
//   } else {
//       console.log("Vibration API is not supported on this device.");
//   }
// }
