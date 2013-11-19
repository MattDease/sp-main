#pragma strict

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

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    // TODO Implement networking to poll masterserver so a list of active
    // games can be displayed

    // TODO - replace with good UI
    GUILayout.Label("Lobby Menu" + (isQuickplay ? " - Quickplay" : ""));
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

    if(GUILayout.Button("Game Menu")){
        leaveFor(menus.game);
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
