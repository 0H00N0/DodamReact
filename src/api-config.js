let backendHost;
const hostname = window && window.location && window.location.hostname;

if (hostname === "localhost") {
  backendHost = "http://localhost:8080";
} else if (hostname === "192.168.219.102") {
  backendHost = "http://192.168.219.102:8080";
}
else {
  backendHost = `http://${hostname}:8080`;
}   
/* else if(hostname === "도메인.확장자"){
    backendHost = "http://도메인.확장자";
}*/

export const API_BASE_URL = backendHost;