#pragma strict

public var gameId : String = "scrambled-by-poached";
public var serverPort : int = 25002;

public var hostData : HostData[];

private var lastHostListRequest : float = 0;
private var onConnection : Function;

function Awake () {

}

function Start () {
    // TODO - Replace with dedicated server info
    MasterServer.ipAddress = "67.255.180.24";
    MasterServer.port = 23466;

    MasterServer.ClearHostList();
    MasterServer.RequestHostList (gameId);

    yield WaitForSeconds(0.5);
    var tries : int=0;
    while(tries<=10){
        if(hostData && hostData.length>0){
            //Waiting for hostData
        }else{
            FetchHostList(true);
        }
        yield WaitForSeconds(0.5);
        tries++;
    }
}

function Connect(ip : String, port : int, callback : Function){
    onConnection = callback;
    Network.Connect(ip, port);
}

function StartHost(numPlayers : int, name : String){
    if(numPlayers <= 2){
        Debug.Log("Player limit of " + numPlayers + " is too low. Player limit is now set to 3");
        numPlayers = 3;
    }
    Network.InitializeServer(numPlayers, serverPort, !Network.HavePublicAddress());
    MasterServer.RegisterHost(gameId, name, "");
}

//limit host list requests to once a minute or 5 seconds if forcing it.
function FetchHostList(manual : boolean){
    if(Network.peerType != NetworkPeerType.Disconnected) return;

    var timeout : int = 60;
    if(manual){
        timeout=5;
    }

    if(lastHostListRequest==0 || Time.realtimeSinceStartup > lastHostListRequest + timeout){
        lastHostListRequest = Time.realtimeSinceStartup;
        MasterServer.RequestHostList (gameId);
        yield WaitForSeconds(1);
        hostData = MasterServer.PollHostList();
        yield WaitForSeconds(1);
        //TODO - sort list by # of players

        Debug.Log("Requested new host list. "+hostData.length+" games listed");
    }
}

function OnConnectedToServer(){
    onConnection();
    onConnection = null;
}
