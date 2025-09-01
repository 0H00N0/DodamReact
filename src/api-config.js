let backendHost;
const hostname = window && window.location && window.location.hostname;
//hostname -> localhost부분만 가져온다.(포트번호 제외)
if(hostname === "localhost"){
    backendHost = "http://localhost:8080";
}else if(hostname ==="192.168.219.224"){
    backendHost = "http://192.168.219.224:8080";
}/*else if(hostname === "도메인.확장자"){
    backendHost = "http://도메인.확장자";
}*/
export const API_BASE_URL = `${backendHost}`;