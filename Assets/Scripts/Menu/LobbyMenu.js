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

private var guiObject : GuiClasses [];
private var guiStatusBar: GuiClasses;
enum Point2 {TopLeft, TopRight, BottomLeft, BottomRight, Center}

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

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);

    guiObject = new GuiClasses[4];
    for (var y=0; y<guiObject.length; y++){
        guiObject[y] = new GuiClasses();
    }

    guiStatusBar = new GuiClasses();
}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    //Back Button
    guiObject[1].textureWidth = Screen.width*0.08;
    guiObject[1].textureHeight = Screen.height*0.2;
    guiObject[1].pointLocation = Points.TopLeft;
    guiObject[1].updateLocation();

    if(GUI.Button(Rect(guiObject[1].offset.x + Screen.width*0.01,guiObject[1].offset.y - Screen.height*0.01,Screen.width*0.08,Screen.height*0.2), backTexture)){
        leaveFor(menus.main);
    }

    guiStatusBar.textureWidth = Screen.width*0.98;
    guiStatusBar.textureHeight = Screen.height*0.147;
    guiStatusBar.pointLocation = Point2.BottomLeft;
    guiStatusBar.updateLocation();

    //Status Bar
    GUI.Box(Rect(guiStatusBar.offset.x + Screen.width*0.01,guiStatusBar.offset.y,Screen.width*0.98,Screen.height*0.12), "Status: Waiting for friends...");

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
    hostList = netScript.GetHostList(filterHosts);

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
