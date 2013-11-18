#pragma strict

import System.Net;
import System.Net.Sockets;

public var hostData : HostData[];

private var masterServerHostname : String = "scrambled.no-ip.biz";
private var gameId : String = "scrambled-by-poached_v1.0.0";
private var gamePort : int = 25002;

private var lastHostListRequest : float = 0;
private var onConnection : Function;

private var natCapable : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
private var probingPublicIP : boolean = false;
private var doneTestingNAT : boolean = false;
private var useNat : boolean = false;
private var timer : float = 0.0;
private var connTestMessage : String = "Undetermined NAT capabilities";

function Awake () {
    // Get Master Server IP from hostname
    try{
        var hostInfo:IPHostEntry = Dns.GetHostEntry(masterServerHostname);
        for(var ip:IPAddress in hostInfo.AddressList){
            if (ip.AddressFamily.ToString() == AddressFamily.InterNetwork.ToString()){
                var masterServerIp : String = ip.ToString();
                Debug.Log("Master server hostname resolved to " + masterServerIp);
            }
        }
    }
    catch(err){
        Debug.Log("Master server hostname resolution error: " + err.Message);
        //fallback to static IP - may be incorrect!
        masterServerIp = "172.19.12.112";
        Debug.Log("Master server IP fallback to: " + masterServerIp);
    }

    // Our Master Server _is_ dedicated but _game_ servers are not dedicated
    // Set this to false to count the host as a player.
    MasterServer.dedicatedServer = false;
    MasterServer.updateRate = 15;
    MasterServer.ipAddress = masterServerIp;
    MasterServer.port = 23466;
    Network.natFacilitatorIP = masterServerIp;
    Network.natFacilitatorPort = 50005;
    Network.connectionTesterIP = masterServerIp;
    Network.connectionTesterPort = 10737;

    // Start connection test
    natCapable = Network.TestConnection();
}

function Start () {
    MasterServer.ClearHostList();
    MasterServer.RequestHostList(gameId);
}

function Update() {
    // If network test is undetermined, keep running
    if (!doneTestingNAT) {
        TestConnection();
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
    Debug.Log("Starting server. Players: " + numPlayers + " Port: " + gamePort + " NAT?: " + useNat);
    var serverError = Network.InitializeServer(numPlayers, gamePort, useNat);
    if(serverError == NetworkConnectionError.NoError){
        MasterServer.RegisterHost(gameId, name, natCapable.ToString());
        return true;
    }
    else{
        Debug.Log("Error starting server: " + serverError);
        return false;
    }
}

//limit host list requests to once every 30 seconds or 3 seconds if forcing it.
function FetchHostList(manual : boolean){
    if(Network.peerType != NetworkPeerType.Disconnected){
        return;
    }

    var timeout : int = manual ? 3 : 30;

    if(lastHostListRequest == 0 || Time.realtimeSinceStartup > lastHostListRequest + timeout){
        lastHostListRequest = Time.realtimeSinceStartup;
        MasterServer.RequestHostList(gameId);
    }
}

function OnConnectedToServer(){
    onConnection();
    onConnection = null;
}

function TestConnection() {
    natCapable = Network.TestConnection();

    switch (natCapable) {
        case ConnectionTesterStatus.Error:
            connTestMessage = "Problem determining NAT capabilities";
            // Be optimistic and don't toggle `canHost` flag. May need to if issues are encountered
            doneTestingNAT = true;
            break;

        case ConnectionTesterStatus.Undetermined:
            connTestMessage = "Undetermined NAT capabilities";
            // Be optimistic and don't toggle `canHost` flag. May need to if issues are encountered
            doneTestingNAT = false;
            break;

        case ConnectionTesterStatus.PublicIPIsConnectable:
            connTestMessage = "Directly connectable public IP address.";
            doneTestingNAT = true;
            useNat = false;
            break;

        // This case is a bit special as we now need to check if we can
        // cicrumvent the blocking by using NAT punchthrough
        case ConnectionTesterStatus.PublicIPPortBlocked:
            connTestMessage = "Non-connectble public IP address (port " + gamePort +" blocked), running a server is impossible.";
            useNat = true;

            // If no NAT punchthrough test has been performed on this public IP, force a test
            if (!probingPublicIP){
                Debug.Log("Testing if firewall can be circumvented");
                natCapable = Network.TestConnectionNAT();
                probingPublicIP = true;
                timer = Time.time + 10;
            }
            // NAT punchthrough test was performed but we still get blocked
            else if (Time.time > timer){
                probingPublicIP = false;
                doneTestingNAT = true;
                useNat = true;
            }
            break;

        case ConnectionTesterStatus.PublicIPNoServerStarted:
            connTestMessage = "Public IP address but server not initialized, " +
                              "it must be started to check server accessibility. " +
                              "Restart connection test when ready.";
            break;

        case ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted:
        case ConnectionTesterStatus.LimitedNATPunchthroughSymmetric:
            connTestMessage = "Limited NAT punchthrough capabilities. Cannot "+
                              "connect to all types of NAT servers. Running a server "+
                              "is ill advised as not everyone can connect.";
            useNat = true;
            doneTestingNAT = true;
            break;

        case ConnectionTesterStatus.NATpunchthroughAddressRestrictedCone:
        case ConnectionTesterStatus.NATpunchthroughFullCone:
            connTestMessage = "NAT punchthrough capable. Can connect to all "+
                              "servers and receive connections from all clients. Enabling "+
                              "NAT punchthrough functionality.";
            useNat = true;
            doneTestingNAT = true;
            break;

        default:
            connTestMessage = "Error in connection test routine, got " + natCapable;
    }

    if(doneTestingNAT){
        Debug.Log("ConnTester> "+connTestMessage);
        var infoMessage = "ConnTester> Test Status: " + natCapable + ". ";
        infoMessage += (probingPublicIP ? "C" : "Not c") + "ircumventing firewall. ";
        infoMessage += (useNat ? "U" : "Not u") + "sing NAT punchthrough. ";
        Debug.Log(infoMessage);
    }
}

function OnMasterServerEvent(event: MasterServerEvent){
    switch(event){
        case MasterServerEvent.HostListReceived:
            hostData = MasterServer.PollHostList();
            Debug.Log(">>> Received new host list. "+hostData.length+" servers registered");
            //TODO - sort list by # of players
            break;
        case MasterServerEvent.RegistrationSucceeded:
            Debug.Log("Host successfully registered with master server.");
            break;
        case MasterServerEvent.RegistrationFailedNoServer:
        case MasterServerEvent.RegistrationFailedGameType:
        case MasterServerEvent.RegistrationFailedGameName:
            Debug.Log("Error registering host: " + event);
            break;
    }
}

function CanConnect(type1: ConnectionTesterStatus, type2: ConnectionTesterStatus) : boolean{
    if (type1 == ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted &&
        type2 == ConnectionTesterStatus.LimitedNATPunchthroughSymmetric)
        return false;
    else if (type1 == ConnectionTesterStatus.LimitedNATPunchthroughSymmetric &&
        type2 == ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted)
        return false;
    else if (type1 == ConnectionTesterStatus.LimitedNATPunchthroughSymmetric &&
        type2 == ConnectionTesterStatus.LimitedNATPunchthroughSymmetric)
        return false;
    return true;
}
