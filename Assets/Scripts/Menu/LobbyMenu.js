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
private var status;
var menuSkin : GUISkin;
var backTexture : Texture2D;
var backgroundTexutre : Texture2D;

function Awake(){
    netScript = GetComponent(Net);
}

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
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);

}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    GUI.skin = menuSkin;

    //Back Button
    guiObject[1].textureWidth = Screen.width*0.08;
    guiObject[1].textureHeight = Screen.height*0.2;
    guiObject[1].pointLocation = Points.TopLeft;
    guiObject[1].updateLocation();

    if(GUI.Button(Rect(guiObject[1].offset.x + Screen.width*0.01,guiObject[1].offset.y - Screen.height*0.01,Screen.width*0.08,Screen.height*0.2), backTexture, "FullImage")){
        leaveFor(menus.main);
    }

    guiStatusBar.textureWidth = Screen.width*1;
    guiStatusBar.textureHeight = Screen.height*0.147;
    guiStatusBar.pointLocation = Points.Center;
    guiStatusBar.updateLocation();

    //Status Bar
   // GUI.Box(Rect(guiStatusBar.offset.x + Screen.width*0.01,guiStatusBar.offset.y,Screen.width*0.98,Screen.height*0.12), ""+status);

    //Refresh Button
    guiObject[0].textureWidth = 170;
    guiObject[0].textureHeight = 20;
    guiObject[0].pointLocation = Points.Center;
    guiObject[0].updateLocation();

    if(GUI.Button(Rect(Screen.width - Screen.width*0.09,guiObject[1].offset.y - Screen.height*0.01,Screen.width*0.08,Screen.height*0.2), backTexture, "FullImage")){
        netScript.FetchHostList(true);
    }

    if(connectionErrorMsg){
        GUILayout.Label(connectionErrorMsg);
    }

    netScript.FetchHostList(false);
    hostList = netScript.GetHostList(filterHosts);

    if(hostList.Count){
        var index = 0;
        for (var element : HostData in hostList){
            GUILayout.BeginHorizontal();
            var name : String = element.gameName + " " + element.connectedPlayers + " / " + element.playerLimit;

            GUILayout.Label(name);
            //GUILayout.Space(5);
            // var hostInfo : String = "[";
            // for (var host : String in element.ip){
            //     hostInfo = hostInfo + host + ":" + element.port + " ";
            // }
            // hostInfo += "]";
            // GUILayout.Label(hostInfo);
            // GUILayout.Space(5);
            // GUILayout.FlexibleSpace();



            if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[0].offset.x * index,guiObject[0].offset.y - 80 * index,170,20), name, "JoinGame")){
                Debug.Log(onConnect);
                netScript.connect(element, onConnect);
                connectionErrorMsg = "";
                isConnecting = true;
            }
            GUILayout.EndHorizontal();
            ++index;
        }
    }
    else{
        //GUILayout.Label("No Games Being Hosted.");
        //status ="No Games Being Hosted.";
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
