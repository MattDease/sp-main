#pragma strict
#pragma downcast

import System.Net;
import System.Net.Sockets;
import System.Collections.Generic;

private var hostList : List.<HostData> = new List.<HostData>();
private var filteredHostList : List.<HostData> = new List.<HostData>();

private var masterServerHostname : String = "scrambled.no-ip.biz";
private var gameId : String = "scrambled-by-poached_v1.0.0";
private var gamePort : int = 25002;

private var lastHostListRequest : float = 0;
//client
private var connectCallback : Function;
//server
private var initializeCallback : Function;

private var natCapable : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
private var probingPublicIP : boolean = false;
private var doneTestingNAT : boolean = false;
private var useNat : boolean = false;
private var timer : float = 0.0;
private var connTestMessage : String = "Undetermined NAT capabilities";

private var hostToConnect : HostData = null;
private var reconnectionTries : int = 0;
private var reconnectionLimit : int = 5;
private var rehostTries : int = 0;
private var rehostLimit : int = 5;

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
        masterServerIp = "172.19.14.114";
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

    if(Config.TEST_CONNECTION){
        // Start connection test
        natCapable = Network.TestConnection();
    }
    else{
        Debug.Log("Connection test skipped due to configuration.");
    }
}

function Start () {
    MasterServer.ClearHostList();
    MasterServer.RequestHostList(gameId);
}

function Update() {
    if (Config.TEST_CONNECTION && !doneTestingNAT) {
        // If network test is undetermined, keep running
        testConnection();
    }
}

function connect(host: HostData, callback : Function){
    hostToConnect = host;
    connectCallback = callback;
    Network.Connect(host);
}

function retryFailedConnect(error: NetworkConnectionError){
    reconnectionTries++;
    if(reconnectionTries > reconnectionLimit){
        Debug.Log("Retry limit reached. Send failure to UI.");
        connectCallback(error);
        return;
    }
    Debug.Log("Retry connecting to server. Retry #" + reconnectionTries);
    yield WaitForSeconds(0.1);
    Network.Connect(hostToConnect);
}

function OnConnectedToServer(){
    Debug.Log("Successfully connected to server as a client");
    reconnectionTries = 0;
    if(connectCallback){
        connectCallback(NetworkConnectionError.NoError);
        connectCallback = null;
    }
}

function OnFailedToConnect(error: NetworkConnectionError){
    Debug.Log("Failed to connect. Error: " + error.ToString());
    switch(error){
        case NetworkConnectionError.CreateSocketOrThreadFailure:
        case NetworkConnectionError.AlreadyConnectedToAnotherServer:
            Network.Disconnect();
            yield WaitForSeconds(0.5);
        case NetworkConnectionError.ConnectionFailed:
        case NetworkConnectionError.InternalDirectConnectFailed:
        case NetworkConnectionError.NATTargetNotConnected:
        case NetworkConnectionError.NATTargetConnectionLost:
        case NetworkConnectionError.NATPunchthroughFailed:
            retryFailedConnect(error);
            break;
        default:
            // No special case that we can fix
            // Don't retry, just forward the error onto the callback
            connectCallback(error);
            break;
    }
}

function startHost(numPlayers : int, name : String, callback : Function){
    Debug.Log("Starting server. Players: " + numPlayers + " Port: " + gamePort + " NAT?: " + useNat);
    // Reduce number of players by one to account for server host who is a player
    numPlayers--;
    if(numPlayers <= 1){
        Debug.Log("Player limit of " + numPlayers + " is too low. Player limit is now set to 3");
        numPlayers = 2;
    }
    initializeCallback = callback;
    var serverError = Network.InitializeServer(numPlayers, gamePort, useNat);
    if(serverError != NetworkConnectionError.NoError){
        Debug.Log("Error starting server: " + serverError);
        if(initializeCallback){
            initializeCallback(false);
            initializeCallback = null;
        }
    }
}

function OnServerInitialized(){
    MasterServer.RegisterHost(gameId, name, natCapable.ToString());
}

function retryFailedHost(){
    rehostTries++;
    if(rehostTries > rehostLimit){
        Debug.Log("Retry registering host limit reached. Send failure to UI.");
        if(initializeCallback){
            initializeCallback(false);
            initializeCallback = null;
        }
        return;
    }
    Debug.Log("Retry registering host. Retry #" + reconnectionTries);
    yield WaitForSeconds(0.1);
    MasterServer.RegisterHost(gameId, name, natCapable.ToString());
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

function GetHostList(filtered : boolean){
    if(filtered && Config.TEST_CONNECTION){
        return filteredHostList;
    }
    else{
        return hostList;
    }
}

function testConnection() {
    natCapable = Network.TestConnection();

    switch (natCapable) {
        case ConnectionTesterStatus.Error:
            connTestMessage = "Problem determining NAT capabilities";
            doneTestingNAT = true;
            break;

        case ConnectionTesterStatus.Undetermined:
            connTestMessage = "Undetermined NAT capabilities";
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
        infoMessage += (probingPublicIP ? "Is" : "Not") + " circumventing firewall. ";
        infoMessage += (useNat ? "Is" : "Not") + " using NAT punchthrough. ";
        Debug.Log(infoMessage);
    }
}

function OnMasterServerEvent(event: MasterServerEvent){
    switch(event){
        case MasterServerEvent.HostListReceived:
            sortAndFilterHostList(MasterServer.PollHostList());
            Debug.Log(">>> Received new host list. "+hostList.Count+" servers registered." + (hostList.Count - filteredHostList.Count) + " filtered out");
            break;
        case MasterServerEvent.RegistrationSucceeded:
            Debug.Log("Host successfully registered with master server.");
            if(initializeCallback){
                initializeCallback(true);
                initializeCallback = null;
            }
            break;
        case MasterServerEvent.RegistrationFailedNoServer:
        case MasterServerEvent.RegistrationFailedGameType:
        case MasterServerEvent.RegistrationFailedGameName:
            Debug.Log("Error registering host: " + event.ToString());
            retryFailedHost();
            break;
    }
}

function OnFailedToConnectToMasterServer(info : NetworkConnectionError){
    Debug.Log("Can't connect to master server: " + info);
    // TODO handle this case nicely. for now, everything breaks if master server is inaccessible
}

function sortAndFilterHostList(sourceData : HostData[]){
    hostList.Clear();
    for(var host : HostData in sourceData){
        hostList.Add(host);
    }
    hostList.Sort(function(a:HostData, b:HostData){
        if(a.connectedPlayers < b.connectedPlayers){
            return -1;
        }
        if(a.connectedPlayers > b.connectedPlayers){
            return 1;
        }
        return 0;
    });
    filteredHostList.Clear();
    for(host in hostList){
        var hostConnTestStatus : ConnectionTesterStatus = System.Enum.Parse(ConnectionTesterStatus, host.comment);
        if(canConnect(natCapable, hostConnTestStatus)){
            filteredHostList.Add(host);
        }
    }
}

function canConnect(type1: ConnectionTesterStatus, type2: ConnectionTesterStatus){
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
