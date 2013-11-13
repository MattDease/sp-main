#pragma strict

import System.Net;
import System.Net.Sockets;

private var masterServerHostname : String = "scrambled.no-ip.biz";
public var gameId : String = "scrambled-by-poached";
public var gamePort : int = 25002;

public var hostData : HostData[];

private var lastHostListRequest : float = 0;
private var onConnection : Function;

function Awake () {
    // TODO - enable once hostname has propagated to DNS servers
    // var hostInfo:IPHostEntry  = Dns.GetHostEntry(masterServerHostname);
    // for(var ip:IPAddress in hostInfo.AddressList){
    //     if (ip.AddressFamily.ToString() == AddressFamily.InterNetwork.ToString()){
    //         var masterServerIp : String = ip.ToString();
    //         Debug.Log("Master server hostname resolved to " + masterServerIp);
    //     }
    // }

    MasterServer.ipAddress = "172.19.12.112";
    MasterServer.port = 23466;
    Network.natFacilitatorIP = "172.19.12.112";
    Network.natFacilitatorPort = 50005;
    Network.connectionTesterIP = "172.19.12.112";
    Network.connectionTesterPort = 10737;
}

function Start () {
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
    if(numPlayers <= 1){
        Debug.Log("Player limit of " + numPlayers + " is too low. Player limit is now set to 3");
        numPlayers = 2;
    }
    Network.InitializeServer(numPlayers, gamePort, !Network.HavePublicAddress());
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
