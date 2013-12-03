#pragma strict
#pragma downcast

private var menuScript : Menu;
private var playerScript : PlayerScript;
private var netScript : Net;

private var hostList : List.<HostData>;

private var showMenu : boolean = false;
private var isQuickplay : boolean = false;
private var isConnecting : boolean = false;
private var filterHosts : boolean = false;

private var connectionErrorMsg : String = "";

function Awake(){
    netScript = GetComponent(Net);
}

var GuiLobby : GuiClasses[];
var menuSkin : GUISkin;
var observeTexture : Texture2D;
var backTexture : Texture2D;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);
    observeTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/observe.jpg", Texture2D);
    backTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/back.jpg", Texture2D);

    GuiLobby = new GuiClasses[2];
    GuiLobby[0] = new GuiClasses();
    GuiLobby[1] = new GuiClasses();
}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    GuiLobby[0].textureWidth = observeTexture.width;
    GuiLobby[0].textureHeight = observeTexture.height;

    GuiLobby[1].textureWidth = backTexture.width;
    GuiLobby[1].textureHeight = backTexture.height;

    GuiLobby[0].pointLocation = GuiLobby[0].Point.TopRight;
    GuiLobby[1].pointLocation = GuiLobby[1].Point.TopLeft;

    for(var x =0; x<GuiLobby.length - 1; x++){
        GuiLobby[x].updateLocation();
    }

    GUI.Box(Rect (0,GuiLobby[0].offset.y + GuiLobby[0].offsetY30 ,Screen.width,30), "Waiting For.....Slow Friends");

    //Observe Button
    if(GUI.Button(Rect(GuiLobby[0].offset.x - GuiLobby[0].offsetY03 ,GuiLobby[0].offset.y + GuiLobby[0].offsetY03 ,observeTexture.width,observeTexture.height), observeTexture)){
    }

    //Back Button
    if(GUI.Button(Rect(GuiLobby[1].offset.x + GuiLobby[1].offsetY03 ,GuiLobby[1].offset.y + GuiLobby[1].offsetY03 ,backTexture.width,backTexture.height), backTexture)){
        leaveFor(menus.main);
    }

    if(GUILayout.Button("Refresh List")){
        netScript.FetchHostList(true);
    }

    if(GUILayout.Button("Toggle host filtering")){
        filterHosts = !filterHosts;
    }

    if(isConnecting){
        GUILayout.Label("Connecting...");
    }

    if(connectionErrorMsg){
        GUILayout.Label(connectionErrorMsg);
    }

    netScript.FetchHostList(false);

    hostList = filterHosts ? netScript.filteredHostList : netScript.hostList;

    GUILayout.Label((filterHosts ? "Connectable" : "All") + " Hosted Games:");
    if(hostList.Count){
        for (var element : HostData in hostList){
            GUILayout.BeginHorizontal();
            var name : String = element.gameName + " " + element.connectedPlayers + " / " + element.playerLimit;
            GUILayout.Label(name);
            GUILayout.Space(5);
            var hostInfo : String = "[";
            for (var host : String in element.ip){
                hostInfo = hostInfo + host + ":" + element.port + " ";
            }
            hostInfo += "]";
            GUILayout.Label(hostInfo);
            GUILayout.Space(5);
            GUILayout.FlexibleSpace();
            if (Network.peerType == NetworkPeerType.Disconnected && GUILayout.Button("Connect")){
                Debug.Log(onConnect);
                netScript.connect(element, onConnect);
                connectionErrorMsg = "";
                isConnecting = true;
            }
            GUILayout.EndHorizontal();
        }
    }
    else{
        GUILayout.Label("No Games Being Hosted.");
    }
}

function onConnect(error: NetworkConnectionError){
    isConnecting = false;
    switch(error){
        case NetworkConnectionError.NoError:
        case NetworkConnectionError.AlreadyConnectedToServer:
            var currentMenu = menuScript.stateScript.getCurrentMenu();
            if(currentMenu == menus.quickplay || currentMenu == menus.lobby){
                leaveFor(menus.game);
            }
            break;
        case NetworkConnectionError.TooManyConnectedPlayers:
            connectionErrorMsg = "Cannot connect. Maximum player limit has been reached.";
            break;
        default:
            // unknown/unresolvable error
            connectionErrorMsg = "Cannot connect to game.";
            break;
    }
};

function enter(quickplay : boolean){
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
