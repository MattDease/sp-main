#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;
private var netScript : Net;

private var showMenu : boolean = false;
private var isQuickplay : boolean = false;

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
    netScript.FetchHostList(false);

    if(netScript.hostData.length){
        GUILayout.Label("All Hosted Games:");
        // Go through all the hosts in the host list
        for (var element : HostData in netScript.hostData){
            GUILayout.BeginHorizontal();
            var name : String = element.gameName + " " + element.connectedPlayers + " / " + element.playerLimit;
            GUILayout.Label(name);
            GUILayout.Space(5);
            var hostInfo : String;
            hostInfo = "[";
            for (var host : String in element.ip){
                hostInfo = hostInfo + host + ":" + element.port + " ";
            }
            hostInfo = hostInfo + "]";
            GUILayout.Label(hostInfo);
            GUILayout.Space(5);
            GUILayout.FlexibleSpace();
            if (Network.peerType == NetworkPeerType.Disconnected && GUILayout.Button("Connect")){
                // Connect to HostData struct, internally the correct method is used (GUID when using NAT).
                netScript.Connect(element.ip[0], element.port, onConnect);
            }
            GUILayout.EndHorizontal();
        }
    }
    else{
        GUILayout.Label("No Games Being Hosted");
    }
}

function enter(quickplay : boolean){
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}

public var onConnect : Function = function(){
    leaveFor(menus.game);
};
