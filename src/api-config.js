let backendHost;
const hostname = window && window.location && window.location.hostname;
console.log("1111111111111--Hostname detected:", hostname);
if (hostname === "3.38.29.41") {
  backendHost = "http://3.38.29.41:8080";
} else if (hostname === "localhost") {
  backendHost = "http://localhost:8080";
} else if (hostname === "dodam.my") {
  backendHost = "http://dodam.my:8080";
} else {
  backendHost = `http://${hostname}:8080`;
}   
/* else if(hostname === "도메인.확장자"){
    backendHost = "http://도메인.확장자";
}*/

export const API_BASE_URL = backendHost;