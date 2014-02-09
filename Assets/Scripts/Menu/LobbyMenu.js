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
private var menuSkin : GUISkin;
private var backTexture : Texture2D;
private var refreshTexture : Texture2D;
private var createNewOverlayTexture : Texture2D;


private var buttonText = 40;
private var bodyText = 50;

var backgroundTexutre : Texture2D;

function Awake(){
    netScript = GetComponent(Net);
}

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);
    refreshTexture = Resources.Load("Textures/gui/refresh", Texture2D);

    guiObject = new GuiClasses[5];
    for (var y=0; y<guiObject.length; y++){
        guiObject[y] = new GuiClasses();
    }

    guiStatusBar = new GuiClasses();
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);
    createNewOverlayTexture = Resources.Load("Textures/gui/createNewOverlay", Texture2D);

}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    GUI.skin = menuSkin;

//Back Button
    guiObject[1].textureWidth = Screen.width * 0.08;
    guiObject[1].textureHeight = Screen.height * 0.2;
    guiObject[1].pointLocation = Points.TopLeft;
    guiObject[1].updateLocation();

    var labelStyle: GUIStyle = GUI.skin.GetStyle("JoinGame");
    labelStyle.fontSize = menuScript.getScale() * buttonText;

    if (GUI.Button(Rect(guiObject[1].offset.x + Screen.width * 0.01, guiObject[1].offset.y - Screen.height * 0.01, Screen.width * 0.08, Screen.height * 0.2), backTexture, "FullImage")) {
        leaveFor(menus.main);
    }

    //Refresh Button
    guiObject[0].textureWidth = 170;
    guiObject[0].textureHeight = 20;
    guiObject[0].pointLocation = Points.Center;
    guiObject[0].updateLocation();

    if (GUI.Button(Rect(Screen.width - Screen.width * 0.09, guiObject[1].offset.y - Screen.height * 0.01, Screen.width * 0.08, Screen.height * 0.2), refreshTexture, "FullImage")) {
        netScript.FetchHostList(true);
    }

    // if(connectionErrorMsg){
    //     GUILayout.Label(connectionErrorMsg);
    // }

    //Center for JoinGame Button
    guiObject[3].textureWidth = (Screen.width * 1.3) * 0.2;
    guiObject[3].textureHeight = Screen.width * 0.2;
    guiObject[3].pointLocation = Points.Center;
    guiObject[3].updateLocation();

    netScript.FetchHostList(false);
    hostList = netScript.GetHostList(filterHosts);

    if (hostList.Count) {
        var index = 0;
        for (var element: HostData in hostList) {

            var name: String = element.gameName + "\n\n " + element.connectedPlayers + " / " + element.playerLimit;

            var f_connected: float = element.connectedPlayers;
            var f_playerLimit: float = element.playerLimit;
            var gamePercentage = f_connected / f_playerLimit;
            Debug.Log(gamePercentage);


            switch (index) {
            case 0:

                if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[3].offset.x, guiObject[3].offset.y - guiObject[3].offset.y / 1.4, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name , "JoinGame")) {
                    Debug.Log(onConnect);
                    netScript.connect(element, onConnect);
                    connectionErrorMsg = "";
                    isConnecting = true;
                }

                break;
            case 1:

                if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[3].offset.x - (guiObject[3].offset.x / 1.1), guiObject[3].offset.y, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name, "JoinGame")) {
                    Debug.Log(onConnect);
                    netScript.connect(element, onConnect);
                    connectionErrorMsg = "";
                    isConnecting = true;
                }
                break;
            case 2:

                if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[3].offset.x + (guiObject[3].offset.x / 1.1), guiObject[3].offset.y, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name, "JoinGame")) {
                    Debug.Log(onConnect);
                    netScript.connect(element, onConnect);
                    connectionErrorMsg = "";
                    isConnecting = true;
                }

                break;
            case 3:
                if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[3].offset.x - guiObject[3].offset.x / 1.9, guiObject[3].offset.y + guiObject[3].offset.y / 1.1, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name, "JoinGame")) {
                    Debug.Log(onConnect);
                    netScript.connect(element, onConnect);
                    connectionErrorMsg = "";
                    isConnecting = true;
                }
                break;
            case 4:
                if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(guiObject[3].offset.x + guiObject[3].offset.x / 1.9, guiObject[3].offset.y + guiObject[3].offset.y / 1.1, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name, "JoinGame")) {
                    Debug.Log(onConnect);
                    netScript.connect(element, onConnect);
                    connectionErrorMsg = "";
                    isConnecting = true;
                }
                break;
            }

            ++index;
        }
    } else {

    var localStyle : GUIStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;


        guiObject[4].textureWidth = Screen.width/1.5;
        guiObject[4].textureHeight = Screen.height/1.5;
        guiObject[4].pointLocation = Points.Center;
        guiObject[4].updateLocation();

        GUI.DrawTexture(new Rect(guiObject[4].offset.x, guiObject[4].offset.y, Screen.width/1.5, Screen.height/1.5), createNewOverlayTexture);
         GUI.Label(Rect(0,0, Screen.width, Screen.height),"No Games Being Hosted", "PlainText");

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
