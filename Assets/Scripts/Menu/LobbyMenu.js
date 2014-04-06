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
private var greenStyle :GUIStyle;
private var backTexture : Texture2D;
private var refreshTexture : Texture2D;
private var createNewOverlayTexture : Texture2D;
private var backgroundTexutre : Texture2D;
private var whiteBarTexture : Texture2D;

private var buttonText = 35;
private var bodyText = 50;


function Awake() {
    netScript = GetComponent(Net);
}

function Start() {
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);
    refreshTexture = Resources.Load("Textures/gui/refresh", Texture2D);

    guiObject = new GuiClasses[6];
    for (var y = 0; y < guiObject.length; y++) {
        guiObject[y] = new GuiClasses();
    }

    guiStatusBar = new GuiClasses();
    backgroundTexutre = Resources.Load("Textures/gui/background", Texture2D);
    createNewOverlayTexture = Resources.Load("Textures/gui/createNewOverlay", Texture2D);

}

function OnGUI() {
    if (!showMenu) {
        return;
    }
    GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), backgroundTexutre);

    GUI.skin = menuSkin;

    //Back Button
    guiObject[1].textureWidth = Screen.width * 0.08;
    guiObject[1].textureHeight = Screen.height * 0.15;
    guiObject[1].setLocation(Points.TopLeft);

    var labelStyle: GUIStyle = GUI.skin.GetStyle("JoinGame");
    labelStyle.fontSize = menuScript.getScale() * buttonText;

    //Refresh Button
    guiObject[0].textureWidth = 170;
    guiObject[0].textureHeight = 20;
    guiObject[0].setLocation(Points.Center);

    if (GUI.Button(Rect(Screen.width - Screen.width * 0.09, guiObject[1].offset.y + Screen.height * 0.02, guiObject[1].textureWidth,  guiObject[1].textureHeight), "", "RefreshButton")) {
        Util.playTap();
        netScript.FetchHostList(true);
    }

    // if(connectionErrorMsg){
    //     GUILayout.Label(connectionErrorMsg);
    // }
    //Center for JoinGame Button
    guiObject[3].textureWidth = (Screen.width * 1.3) * 0.2;
    guiObject[3].textureHeight = Screen.width * 0.2;
    guiObject[3].setLocation(Points.Center);

    netScript.FetchHostList(false);
    hostList = netScript.GetHostList(filterHosts);

    if (hostList.Count) {
        var index = 0;
        for (var element: HostData in hostList) {
            var f_connected: float = element.connectedPlayers;
            var f_playerLimit: float = element.playerLimit;
            var gamePercentage = f_connected / f_playerLimit;

            //TODO: Temp just showing the first five. Need to add some logic in here.
            var placementY: float;
            var placementX: float;


            switch (index) {
            case 0:
                placementX = guiObject[3].offset.x;
                placementY = guiObject[3].offset.y - guiObject[3].offset.y / 1.4;
                break;
            case 1:
                placementX = guiObject[3].offset.x - (guiObject[3].offset.x / 1.1);
                placementY = guiObject[3].offset.y;
                break;
            case 2:
                placementX = guiObject[3].offset.x + (guiObject[3].offset.x / 1.1);
                placementY = guiObject[3].offset.y;
                break;
            case 3:
                placementX = guiObject[3].offset.x - guiObject[3].offset.x / 1.9;
                placementY = guiObject[3].offset.y + guiObject[3].offset.y / 1.1;
                break;
            case 4:
                placementX = guiObject[3].offset.x + guiObject[3].offset.x / 1.9;
                placementY = guiObject[3].offset.y + guiObject[3].offset.y / 1.1;
                break;
            }

            joinGame(element, placementX, placementY);

            ++index;
        }
    } else {

        var localStyle: GUIStyle = GUI.skin.GetStyle("PlainText");
        localStyle.fontSize = menuScript.getScale() * bodyText;

        guiObject[4].textureWidth = Screen.width / 1.5;
        guiObject[4].textureHeight = Screen.height / 1.5;
        guiObject[4].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiObject[4].offset.x, guiObject[4].offset.y, Screen.width / 1.5, Screen.height / 1.5), createNewOverlayTexture);
        GUI.Label(Rect(0, 0, Screen.width, Screen.height), "No Games Being Hosted", "PlainText");
    }

    greenStyle = GUI.skin.GetStyle("GreenButton");
    greenStyle.fontSize = menuScript.getScale() * buttonText;

    guiObject[5].textureWidth = Screen.width * 0.17;
    guiObject[5].textureHeight = Screen.height * 0.14;
    guiObject[5].setLocation(Points.BottomRight);

    if(GUI.Button(Rect(guiObject[5].offset.x, Screen.height - Screen.height * 0.13, guiObject[5].textureWidth, guiObject[5].textureHeight), "NEW GAME", "GreenButton")){
        Util.playTap();
        leaveFor(menus.host);
    }

}

function joinGame(element : HostData, placementX : float, placementY : float){

    var name: String = element.gameName + "\n Players: " + element.connectedPlayers;
    if (Network.peerType == NetworkPeerType.Disconnected && GUI.Button(Rect(placementX, placementY, (Screen.width * 1.3) * 0.2, Screen.width * 0.2), name, "JoinGame")) {
        netScript.connect(element, onConnect);
        connectionErrorMsg = "";
        isConnecting = true;
        Util.playTap();
    }

}

function onConnect(error: NetworkConnectionError) {
    isConnecting = false;
    switch (error) {
    case NetworkConnectionError.NoError:
    case NetworkConnectionError.AlreadyConnectedToServer:
        var currentMenu = menuScript.stateScript.getCurrentMenu();
        if (currentMenu == menus.quickplay || currentMenu == menus.lobby) {
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

function enter(quickplay: boolean) {
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu: menus) {
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
