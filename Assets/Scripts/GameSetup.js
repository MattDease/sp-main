#pragma strict

import System.Collections.Generic;

class Player{
    var name : String;
    var isSelf : boolean;
    var netPlayer : NetworkPlayer;
    //add other player attributes like heath, team, etc here
}

public var playerPrefab : Transform;

public var playerList : List.<Player> = new List.<Player>();

function registerPlayerRPC(name : String){
    networkView.RPC("registerRemotePlayer", RPCMode.OthersBuffered, name);
    registerPlayer(name, Network.player, true);
}

@RPC
function registerRemotePlayer(name : String, info : NetworkMessageInfo){
    registerPlayer(name, info.sender, false);
}

function registerPlayer(name : String, netPlayer : NetworkPlayer, isSelf : boolean){
    var newPlayer = new Player();
    newPlayer.name = name;
    newPlayer.isSelf = isSelf;
    newPlayer.netPlayer = netPlayer;
    playerList.Add(newPlayer);
}

function OnPlayerDisconnected(netPlayer: NetworkPlayer){
    networkView.RPC("notifyOtherPlayerDisconnected", RPCMode.OthersBuffered, netPlayer);
    otherPlayerDisconnected(netPlayer);
}

@RPC
function notifyOtherPlayerDisconnected(netPlayer : NetworkPlayer){
    otherPlayerDisconnected(netPlayer);
}

function otherPlayerDisconnected(netPlayer:NetworkPlayer){
    for(var player : Player in playerList){
        if(player.netPlayer == netPlayer){
            Debug.Log("Player '" + player.name + "' disconnected.");
            playerList.Remove(player);
            break;
        }
    }
    // Network.RemoveRPCs(player);
    // Network.DestroyPlayerObjects(player);
}
